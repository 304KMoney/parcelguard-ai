import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AI_DISCLAIMER } from "@/lib/anthropic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const parcel = await prisma.parcel.findFirst({
    where: { id, userId: user.id },
    include: {
      score: true,
      conflictFlags: true,
    },
  });

  if (!parcel) {
    return NextResponse.json({ error: "Parcel not found" }, { status: 404 });
  }

  if (!parcel.score) {
    return NextResponse.json(
      { error: "Please generate a risk score first before creating a report." },
      { status: 400 }
    );
  }

  try {
    // Build report text content
    const topRiskDrivers = parcel.score.topRiskDrivers as Array<{
      driver: string;
      category: string;
      severity: string;
      explanation: string;
    }> | null;

    const missingFields = Array.isArray(parcel.missingFields)
      ? (parcel.missingFields as string[])
      : [];

    const reportText = `
PARCELGUARD AI — INVESTOR BRIEF
================================
${AI_DISCLAIMER}

PROPERTY INFORMATION
--------------------
Address: ${parcel.situsAddress ?? "MISSING"}
Parcel ID: ${parcel.parcelId ?? "MISSING"}
County, State: ${parcel.county ?? "?"}, ${parcel.state ?? "?"}
Owner: ${parcel.ownerName ?? "MISSING"}
Property Type: ${parcel.propertyType ?? "Unknown"}
Legal Description: ${parcel.legalDescription ?? "Not provided"}

AUCTION DETAILS
---------------
Auction Type: ${parcel.auctionType ?? "Unknown"}
Opening Bid: ${parcel.openingBid ? `$${parcel.openingBid.toLocaleString()}` : "MISSING"}
Redemption Period: ${parcel.redemptionPeriod ?? "Unknown"}
Platform: ${parcel.auctionPlatform ?? "Not specified"}

FINANCIAL SUMMARY
-----------------
Assessed Value: ${parcel.assessedValue ? `$${parcel.assessedValue.toLocaleString()}` : "MISSING"}
Tax Amount Owed: ${parcel.taxAmountOwed ? `$${parcel.taxAmountOwed.toLocaleString()}` : "MISSING"}
Opening Bid: ${parcel.openingBid ? `$${parcel.openingBid.toLocaleString()}` : "MISSING"}

RISK SCORES
-----------
DealRisk Score: ${parcel.score.dealRiskScore}/100 (higher = more risky)
SourceTrust Score: ${parcel.score.sourceTrustScore}/100 (higher = better data)
MaxBid Guardrail: ${parcel.score.maxBidAmount ? `$${parcel.score.maxBidAmount.toLocaleString()}` : "Cannot calculate"}

Note: MaxBid figures are estimates based on limited available data. Not an appraisal or investment recommendation.

TOP RISK DRIVERS
----------------
${topRiskDrivers && topRiskDrivers.length > 0
  ? topRiskDrivers
      .map(
        (d, i) =>
          `${i + 1}. [${d.severity.toUpperCase()}] ${d.driver} (${d.category})\n   ${d.explanation}`
      )
      .join("\n\n")
  : "No risk drivers identified."}

MISSING DATA FIELDS
-------------------
${missingFields.length > 0 ? missingFields.join(", ") : "None identified"}
${missingFields.length > 0 ? "⚠ Verify all missing fields before bidding." : ""}

CONFLICT FLAGS
--------------
${
  parcel.conflictFlags.length > 0
    ? parcel.conflictFlags
        .map(
          (f) =>
            `[${f.severity.toUpperCase()}] ${f.title}\n${f.description}${f.whatToDo ? `\nAction: ${f.whatToDo}` : ""}`
        )
        .join("\n\n")
    : "No conflicts detected in uploaded data."
}

AI RISK NARRATIVE
-----------------
${parcel.score.aiNarrative ?? "Score this parcel to generate an AI narrative."}

BIDREADY CHECKLIST — MUST COMPLETE BEFORE BIDDING
--------------------------------------------------
☐ Confirm parcel ID with county assessor
☐ Verify situs address matches county records
☐ Confirm ownership and entity type
☐ Verify assessed value is current
☐ Check for senior liens (federal tax, HOA, municipal)
☐ Verify auction type and title transfer process
☐ Confirm redemption period and deadline
☐ Research title chain and quiet title requirements
☐ Drive by or virtual property inspection
☐ Check FEMA flood zone status
☐ Verify road access / landlocked status
☐ Confirm property is still in the sale
☐ Verify payment deadline and methods
☐ Do not bid above MaxBid Guardrail

SCORING METHODOLOGY
-------------------
SourceTrust Score (0–100) measures data quality across field presence, source confirmation,
conflict detection, and data freshness. DealRisk Score (0–100) evaluates six risk categories:
data risk (20%), property risk (25%), legal/process risk (20%), auction risk (15%), liquidity
risk (10%), and valuation risk (10%). Higher scores indicate higher risk.

DISCLAIMER
----------
${AI_DISCLAIMER}

ParcelGuard AI provides research support and data analysis tools only. It does not provide
legal, tax, title, financial, or investment advice. All information is for research purposes only.
Information may be incomplete, outdated, or inaccurate. You are solely responsible for verifying
all information before bidding. Bidding on tax sale properties involves significant financial risk.

Generated: ${new Date().toISOString()}
ParcelGuard AI © 2026
    `.trim();

    // Try to upload to Vercel Blob if token is available
    let blobUrl: string | null = null;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = await import("@vercel/blob");
        const fileName = `reports/${user.id}/${parcel.id}-${Date.now()}.txt`;
        const blob = await put(fileName, reportText, {
          access: "public",
          contentType: "text/plain",
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        blobUrl = blob.url;
      } catch (blobErr) {
        console.error("Blob upload failed:", blobErr);
        // Continue without blob — report still created
      }
    }

    // Create report record
    const report = await prisma.report.create({
      data: {
        parcelId: parcel.id,
        userId: user.id,
        title: `Investor Brief — ${parcel.situsAddress ?? parcel.parcelId ?? "Property"}`,
        status: "ready",
        blobUrl,
      },
    });

    return NextResponse.json({
      success: true,
      reportId: report.id,
      blobUrl,
      reportText: blobUrl ? undefined : reportText, // Return text if no blob
    });
  } catch (err) {
    console.error("Report generation error:", err);
    return NextResponse.json(
      { error: "Report generation failed. Please try again." },
      { status: 500 }
    );
  }
}
