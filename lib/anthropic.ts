import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const AI_DISCLAIMER =
  "⚠️ AI-generated analysis. Not legal, tax, title, financial, or investment advice. Verify all data with the applicable county, auction provider, title professional, and licensed attorney before bidding on any property.";

export interface ParcelAIInput {
  parcelId: string | null;
  situsAddress: string | null;
  county: string | null;
  state: string | null;
  ownerName: string | null;
  propertyType: string | null;
  assessedValue: number | null;
  taxAmountOwed: number | null;
  openingBid: number | null;
  auctionType: string | null;
  redemptionPeriod: string | null;
  dealRiskScore: number;
  sourceTrustScore: number;
  maxBidAmount: number | null;
  topRiskDrivers: Array<{
    driver: string;
    category: string;
    severity: string;
    explanation: string;
  }>;
  missingFields: string[];
  conflictFlags: Array<{
    flagType: string;
    severity: string;
    description: string;
  }>;
}

export async function generateParcelNarrative(input: ParcelAIInput): Promise<string> {
  const prompt = `You are a professional tax sale due diligence analyst. Generate a concise, factual pre-bid risk narrative for the following parcel.

PARCEL DATA:
- Parcel ID: ${input.parcelId ?? "MISSING"}
- Address: ${input.situsAddress ?? "MISSING"}
- County/State: ${input.county ?? "?"}, ${input.state ?? "?"}
- Owner: ${input.ownerName ?? "MISSING"}
- Property Type: ${input.propertyType ?? "Unknown"}
- Assessed Value: ${input.assessedValue ? `$${input.assessedValue.toLocaleString()}` : "MISSING"}
- Tax Owed: ${input.taxAmountOwed ? `$${input.taxAmountOwed.toLocaleString()}` : "MISSING"}
- Opening Bid: ${input.openingBid ? `$${input.openingBid.toLocaleString()}` : "MISSING"}
- Auction Type: ${input.auctionType ?? "Unknown"}
- Redemption Period: ${input.redemptionPeriod ?? "Unknown"}

SCORES:
- DealRisk Score: ${input.dealRiskScore}/100 (higher = riskier)
- SourceTrust Score: ${input.sourceTrustScore}/100 (higher = more reliable data)
- Conservative Max Bid: ${input.maxBidAmount ? `$${input.maxBidAmount.toLocaleString()}` : "Cannot calculate"}

TOP RISK DRIVERS:
${input.topRiskDrivers.map((r, i) => `${i + 1}. [${r.severity.toUpperCase()}] ${r.driver} (${r.category}): ${r.explanation}`).join("\n")}

MISSING FIELDS: ${input.missingFields.length > 0 ? input.missingFields.join(", ") : "None"}

CONFLICT FLAGS: ${input.conflictFlags.length > 0 ? input.conflictFlags.map((f) => `${f.flagType} (${f.severity}): ${f.description}`).join("; ") : "None detected"}

Write a 3-4 paragraph professional narrative that:
1. Summarizes the overall risk profile and key concerns for this specific parcel
2. Explains the most important risk factors in plain English
3. Lists what an investor MUST verify before bidding
4. States a clear recommendation (proceed with verification / approach with caution / avoid)

Be factual, specific, and conservative. Do not speculate beyond the data. Use professional financial language. Do not include the disclaimer — it will be added separately.`;

  const message = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const textContent = message.content.find((c) => c.type === "text");
  return textContent?.text ?? "Unable to generate narrative.";
}

export async function generateInvestorReport(parcels: ParcelAIInput[], county: string, state: string): Promise<string> {
  const topOpportunities = parcels
    .filter((p) => p.dealRiskScore <= 50)
    .sort((a, b) => a.dealRiskScore - b.dealRiskScore)
    .slice(0, 5);

  const avoidList = parcels
    .filter((p) => p.dealRiskScore > 75)
    .sort((a, b) => b.dealRiskScore - a.dealRiskScore)
    .slice(0, 5);

  const prompt = `You are a professional tax sale due diligence analyst. Generate a pre-bid investor brief for a county tax sale.

COUNTY: ${county}, ${state}
TOTAL PARCELS ANALYZED: ${parcels.length}
AVERAGE DEAL RISK SCORE: ${Math.round(parcels.reduce((s, p) => s + p.dealRiskScore, 0) / parcels.length)}/100
AVERAGE SOURCE TRUST SCORE: ${Math.round(parcels.reduce((s, p) => s + p.sourceTrustScore, 0) / parcels.length)}/100

TOP OPPORTUNITIES (lowest risk):
${topOpportunities.map((p, i) => `${i + 1}. ${p.situsAddress ?? p.parcelId} — Risk: ${p.dealRiskScore}/100, Trust: ${p.sourceTrustScore}/100, Opening Bid: $${(p.openingBid ?? 0).toLocaleString()}, Max Bid: ${p.maxBidAmount ? `$${p.maxBidAmount.toLocaleString()}` : "N/A"}`).join("\n")}

AVOID LIST (highest risk):
${avoidList.map((p, i) => `${i + 1}. ${p.situsAddress ?? p.parcelId} — Risk: ${p.dealRiskScore}/100 — Top risk: ${p.topRiskDrivers[0]?.driver ?? "Multiple factors"}`).join("\n")}

Write a professional investor brief with:
1. Executive summary of this county sale
2. Top 3-5 opportunities with rationale
3. Properties to avoid and why
4. Key verification checklist for this county/auction type
5. Overall market assessment

Professional financial language. Conservative recommendations. Be specific about verification steps needed.`;

  const message = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const textContent = message.content.find((c) => c.type === "text");
  return textContent?.text ?? "Unable to generate report.";
}
