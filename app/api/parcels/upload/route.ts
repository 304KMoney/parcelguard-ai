import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scoreParcel } from "@/lib/scoring";

// CSV column header synonyms
const COLUMN_MAP: Record<string, string> = {
  // parcel_id
  parcel_id: "parcelId",
  parcelid: "parcelId",
  apn: "parcelId",
  "parcel number": "parcelId",
  "parcel no": "parcelId",
  pin: "parcelId",
  "tax id": "parcelId",

  // situs_address
  situs_address: "situsAddress",
  situsaddress: "situsAddress",
  address: "situsAddress",
  "property address": "situsAddress",
  "site address": "situsAddress",
  location: "situsAddress",

  // owner_name
  owner_name: "ownerName",
  ownername: "ownerName",
  owner: "ownerName",
  "owner name": "ownerName",
  taxpayer: "ownerName",

  // county
  county: "county",

  // state
  state: "state",

  // assessed_value
  assessed_value: "assessedValue",
  assessedvalue: "assessedValue",
  "assessed value": "assessedValue",
  "just value": "assessedValue",
  "market value": "assessedValue",
  value: "assessedValue",

  // tax_amount_owed
  tax_amount_owed: "taxAmountOwed",
  taxamountowed: "taxAmountOwed",
  "tax amount": "taxAmountOwed",
  "amount owed": "taxAmountOwed",
  "total due": "taxAmountOwed",
  delinquent: "taxAmountOwed",

  // opening_bid
  opening_bid: "openingBid",
  openingbid: "openingBid",
  "opening bid": "openingBid",
  "minimum bid": "openingBid",
  "starting bid": "openingBid",

  // auction_type
  auction_type: "auctionType",
  auctiontype: "auctionType",
  "auction type": "auctionType",
  type: "auctionType",
  "sale type": "auctionType",

  // redemption_period
  redemption_period: "redemptionPeriod",
  redemptionperiod: "redemptionPeriod",
  "redemption period": "redemptionPeriod",
  redemption: "redemptionPeriod",

  // property_type
  property_type: "propertyType",
  propertytype: "propertyType",
  "property type": "propertyType",
  "land use": "propertyType",
  class: "propertyType",

  // city
  city: "city",
  municipality: "city",

  // zip
  zip: "zip",
  zipcode: "zip",
  "zip code": "zip",
  postal: "zip",

  // sale_date
  sale_date: "saleDate",
  saledate: "saleDate",
  "sale date": "saleDate",
  "auction date": "saleDate",
};

type ParsedRow = Record<string, string>;

function normalizeHeaders(headers: string[]): string[] {
  return headers.map((h) => {
    const lower = h.toLowerCase().trim();
    return COLUMN_MAP[lower] ?? h;
  });
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const rawHeaders = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const headers = normalizeHeaders(rawHeaders);

  return lines.slice(1).map((line) => {
    const values = line.match(/("(?:[^"]|"")*"|[^,]*)/g) ?? [];
    const row: ParsedRow = {};
    headers.forEach((h, i) => {
      const val = (values[i] ?? "").trim().replace(/^"|"$/g, "").trim();
      if (val) row[h] = val;
    });
    return row;
  });
}

function detectMissingFields(row: ParsedRow): string[] {
  const critical = [
    "parcelId",
    "situsAddress",
    "ownerName",
    "assessedValue",
    "taxAmountOwed",
    "openingBid",
    "auctionType",
    "county",
    "state",
  ];
  return critical.filter((f) => !row[f]);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure user exists in DB
  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    update: {},
    create: {
      clerkId: userId,
      email: `${userId}@parcelguard.ai`, // Will be updated by webhook
      plan: "starter",
      aiCreditsLimit: 50,
    },
  });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const content = formData.get("content") as string | null;

    let csvText = "";
    let sourceFileName = "pasted-data";

    if (file) {
      sourceFileName = file.name;
      const buffer = await file.arrayBuffer();
      csvText = new TextDecoder().decode(buffer);
    } else if (content) {
      csvText = content;
    } else {
      return NextResponse.json(
        { error: "No file or content provided" },
        { status: 400 }
      );
    }

    const rows = parseCSV(csvText);

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          parcelsCreated: 0,
          message: "No parseable rows found. Ensure the file has headers and data rows.",
        },
        { status: 400 }
      );
    }

    let created = 0;
    const errors: string[] = [];

    // Process rows (cap at 200 for MVP)
    const rowsToProcess = rows.slice(0, 200);

    for (const row of rowsToProcess) {
      try {
        const missing = detectMissingFields(row);

        const parcelData = {
          userId: user.id,
          parcelId: row["parcelId"] ?? null,
          county: row["county"] ?? null,
          state: row["state"] ?? null,
          ownerName: row["ownerName"] ?? null,
          situsAddress: row["situsAddress"] ?? null,
          city: row["city"] ?? null,
          zip: row["zip"] ?? null,
          propertyType: row["propertyType"]?.toLowerCase().replace(/ /g, "_") ?? null,
          legalDescription: row["legalDescription"] ?? null,
          assessedValue: row["assessedValue"] ? parseFloat(row["assessedValue"].replace(/[$,]/g, "")) : null,
          taxAmountOwed: row["taxAmountOwed"] ? parseFloat(row["taxAmountOwed"].replace(/[$,]/g, "")) : null,
          openingBid: row["openingBid"] ? parseFloat(row["openingBid"].replace(/[$,]/g, "")) : null,
          auctionType: row["auctionType"]?.toLowerCase() ?? null,
          auctionPlatform: row["auctionPlatform"] ?? null,
          redemptionPeriod: row["redemptionPeriod"] ?? null,
          sourceFileName,
          missingFields: missing,
        };

        const parcel = await prisma.parcel.create({ data: parcelData });

        // Auto-score with rule-based engine (no AI credits needed)
        const scoringInput = {
          parcelId: parcelData.parcelId,
          situsAddress: parcelData.situsAddress,
          ownerName: parcelData.ownerName,
          assessedValue: parcelData.assessedValue,
          taxAmountOwed: parcelData.taxAmountOwed,
          openingBid: parcelData.openingBid,
          auctionType: parcelData.auctionType,
          propertyType: parcelData.propertyType,
          redemptionPeriod: parcelData.redemptionPeriod,
          legalDescription: parcelData.legalDescription,
          county: parcelData.county,
          state: parcelData.state,
          missingFields: missing,
        };

        const score = scoreParcel(scoringInput);

        await prisma.parcelScore.create({
          data: {
            parcelId: parcel.id,
            dealRiskScore: score.dealRiskScore,
            sourceTrustScore: score.sourceTrustScore,
            maxBidAmount: score.maxBidAmount,
            topRiskDrivers: JSON.parse(JSON.stringify(score.topRiskDrivers)),
            // AI narrative generated on-demand per parcel
          },
        });

        // Create conflict flags based on owner signals
        const ownerLower = (parcelData.ownerName ?? "").toLowerCase();
        if (ownerLower.includes("estate") || ownerLower.includes("deceased")) {
          await prisma.conflictFlag.create({
            data: {
              parcelId: parcel.id,
              flagType: "deceased_owner_signal",
              severity: "alert",
              title: "Deceased Owner / Estate Signal",
              description: `Owner name "${parcelData.ownerName}" contains estate or deceased signals. Heir complexity likely.`,
              whatToDo:
                "Research chain of title. Quiet title may be required ($3–8K+, 6–18 months). Consult a licensed attorney.",
            },
          });
        }

        if (missing.length >= 4) {
          await prisma.conflictFlag.create({
            data: {
              parcelId: parcel.id,
              flagType: "insufficient_data",
              severity: "stop",
              title: "Insufficient Data",
              description: `${missing.length} critical fields are missing: ${missing.join(", ")}.`,
              whatToDo:
                "Do not bid until all critical fields are verified with the county assessor and auction provider.",
            },
          });
        }

        created++;
      } catch (rowErr) {
        errors.push(
          `Row error: ${rowErr instanceof Error ? rowErr.message : "Unknown"}`
        );
      }
    }

    const truncated = rows.length > 200;

    return NextResponse.json({
      success: true,
      parcelsCreated: created,
      message: `Successfully processed ${created} parcel${created !== 1 ? "s" : ""}${truncated ? ` (first 200 of ${rows.length} rows)` : ""}.`,
      errors: errors.slice(0, 5),
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      {
        success: false,
        parcelsCreated: 0,
        message: "Upload processing failed. Please check your file format and try again.",
      },
      { status: 500 }
    );
  }
}
