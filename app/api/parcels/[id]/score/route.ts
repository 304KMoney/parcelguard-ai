import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scoreParcel } from "@/lib/scoring";
import { generateParcelNarrative, type ParcelAIInput } from "@/lib/anthropic";

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
    include: { score: true, conflictFlags: true },
  });

  if (!parcel) {
    return NextResponse.json({ error: "Parcel not found" }, { status: 404 });
  }

  // Check AI credits
  if (user.aiCreditsUsed >= user.aiCreditsLimit) {
    return NextResponse.json(
      { error: "AI credits exhausted. Upgrade your plan for more." },
      { status: 402 }
    );
  }

  try {
    // Run rule-based scoring
    const missingFields = Array.isArray(parcel.missingFields)
      ? (parcel.missingFields as string[])
      : [];

    const scoringInput = {
      parcelId: parcel.parcelId,
      situsAddress: parcel.situsAddress,
      ownerName: parcel.ownerName,
      assessedValue: parcel.assessedValue,
      taxAmountOwed: parcel.taxAmountOwed,
      openingBid: parcel.openingBid,
      auctionType: parcel.auctionType,
      propertyType: parcel.propertyType,
      redemptionPeriod: parcel.redemptionPeriod,
      legalDescription: parcel.legalDescription,
      county: parcel.county,
      state: parcel.state,
      missingFields,
    };

    const score = scoreParcel(scoringInput);

    // Generate AI narrative
    const aiInput: ParcelAIInput = {
      parcelId: parcel.parcelId,
      situsAddress: parcel.situsAddress,
      county: parcel.county,
      state: parcel.state,
      ownerName: parcel.ownerName,
      propertyType: parcel.propertyType,
      assessedValue: parcel.assessedValue,
      taxAmountOwed: parcel.taxAmountOwed,
      openingBid: parcel.openingBid,
      auctionType: parcel.auctionType,
      redemptionPeriod: parcel.redemptionPeriod,
      dealRiskScore: score.dealRiskScore,
      sourceTrustScore: score.sourceTrustScore,
      maxBidAmount: score.maxBidAmount,
      topRiskDrivers: score.topRiskDrivers,
      missingFields: score.missingFieldsList,
      conflictFlags: parcel.conflictFlags.map((f) => ({
        flagType: f.flagType,
        severity: f.severity,
        description: f.description,
      })),
    };

    let aiNarrative = "";
    try {
      aiNarrative = await generateParcelNarrative(aiInput);
    } catch (aiErr) {
      console.error("AI narrative failed:", aiErr);
      aiNarrative = "AI narrative generation failed. Rule-based scoring is available above.";
    }

    // Upsert score
    const savedScore = await prisma.parcelScore.upsert({
      where: { parcelId: parcel.id },
      update: {
        dealRiskScore: score.dealRiskScore,
        sourceTrustScore: score.sourceTrustScore,
        maxBidAmount: score.maxBidAmount,
        aiNarrative,
        topRiskDrivers: JSON.parse(JSON.stringify(score.topRiskDrivers)),
        scoredAt: new Date(),
      },
      create: {
        parcelId: parcel.id,
        dealRiskScore: score.dealRiskScore,
        sourceTrustScore: score.sourceTrustScore,
        maxBidAmount: score.maxBidAmount,
        aiNarrative,
        topRiskDrivers: JSON.parse(JSON.stringify(score.topRiskDrivers)),
      },
    });

    // Increment AI credits
    await prisma.user.update({
      where: { id: user.id },
      data: { aiCreditsUsed: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      score: savedScore,
    });
  } catch (err) {
    console.error("Scoring error:", err);
    return NextResponse.json(
      { error: "Scoring failed. Please try again." },
      { status: 500 }
    );
  }
}
