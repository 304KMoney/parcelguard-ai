/**
 * ParcelGuard AI — Scoring Engine
 * ================================
 * DealRisk Score (0-100): higher = MORE risky
 * SourceTrust Score (0-100): higher = BETTER data quality
 * MaxBid = conservative bid ceiling based on risk multiplier
 */

export type RiskBand = "green" | "yellow" | "orange" | "red" | "black";
export type TrustBand = "high" | "medium" | "low" | "critical" | "insufficient";

export interface ScoringInput {
  parcelId: string | null;
  situsAddress: string | null;
  ownerName: string | null;
  assessedValue: number | null;
  taxAmountOwed: number | null;
  openingBid: number | null;
  auctionType: string | null;
  propertyType: string | null;
  redemptionPeriod: string | null;
  legalDescription: string | null;
  county: string | null;
  state: string | null;
  missingFields?: string[];
}

export interface ScoringResult {
  dealRiskScore: number;
  sourceTrustScore: number;
  maxBidAmount: number | null;
  riskBand: RiskBand;
  trustBand: TrustBand;
  riskLabel: string;
  trustLabel: string;
  topRiskDrivers: RiskDriver[];
  missingFieldsList: string[];
}

export interface RiskDriver {
  driver: string;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  explanation: string;
}

// ─── SourceTrust Score ───────────────────────────────────────────────────────

const FIELD_WEIGHTS: Record<string, number> = {
  parcelId: 0.20,
  situsAddress: 0.15,
  ownerName: 0.10,
  legalDescription: 0.15,
  assessedValue: 0.15,
  taxAmountOwed: 0.10,
  auctionType: 0.10,
  propertyType: 0.05,
};

function calculateSourceTrustScore(input: ScoringInput): {
  score: number;
  missingFields: string[];
  band: TrustBand;
  label: string;
} {
  const missing: string[] = [];
  let fieldScore = 0;

  const fields = [
    { key: "parcelId", value: input.parcelId },
    { key: "situsAddress", value: input.situsAddress },
    { key: "ownerName", value: input.ownerName },
    { key: "legalDescription", value: input.legalDescription },
    { key: "assessedValue", value: input.assessedValue },
    { key: "taxAmountOwed", value: input.taxAmountOwed },
    { key: "auctionType", value: input.auctionType },
    { key: "propertyType", value: input.propertyType },
  ];

  for (const field of fields) {
    const weight = FIELD_WEIGHTS[field.key] ?? 0;
    const isPresent = field.value !== null && field.value !== undefined && field.value !== "";

    if (!isPresent) {
      missing.push(field.key);
      // Missing field contributes 0
    } else {
      // Single-source confidence: 0.80 multiplier
      fieldScore += weight * 0.80 * 100;
    }
  }

  // Data freshness: assume single-source = 0.92 multiplier
  const freshnessMultiplier = 0.92;
  const rawScore = fieldScore * freshnessMultiplier;

  // Conflict penalty: no cross-source conflicts in MVP (user uploads single source)
  const conflictPenalty = 0;

  const finalScore = Math.max(0, Math.min(100, rawScore - conflictPenalty));
  const score = Math.round(finalScore);

  let band: TrustBand;
  let label: string;

  if (score >= 80) {
    band = "high";
    label = "High Confidence";
  } else if (score >= 60) {
    band = "medium";
    label = "Medium Confidence";
  } else if (score >= 40) {
    band = "low";
    label = "Low Confidence";
  } else if (score >= 20) {
    band = "critical";
    label = "Critical — Verify Immediately";
  } else {
    band = "insufficient";
    label = "Insufficient Data";
  }

  return { score, missingFields: missing, band, label };
}

// ─── DealRisk Score ──────────────────────────────────────────────────────────

function calculateDealRiskScore(input: ScoringInput, missingFields: string[]): {
  score: number;
  band: RiskBand;
  label: string;
  topDrivers: RiskDriver[];
} {
  const penalties: Array<{ category: string; driver: string; points: number; severity: "low" | "medium" | "high" | "critical"; explanation: string }> = [];

  // ── Category 1: Data Risk (20%) ──
  if (!input.parcelId) {
    penalties.push({
      category: "Data Risk",
      driver: "Missing Parcel ID",
      points: 30,
      severity: "critical",
      explanation: "No parcel ID means this property cannot be verified with the county. Do not bid.",
    });
  }
  if (!input.situsAddress) {
    penalties.push({
      category: "Data Risk",
      driver: "No Property Address",
      points: 25,
      severity: "critical",
      explanation: "Without a situs address, you cannot locate, inspect, or verify this property.",
    });
  }
  if (missingFields.length >= 3) {
    penalties.push({
      category: "Data Risk",
      driver: "Multiple Missing Fields",
      points: 25,
      severity: "high",
      explanation: `${missingFields.length} critical fields are missing from this parcel record. Data confidence is severely limited.`,
    });
  } else if (missingFields.length >= 1) {
    penalties.push({
      category: "Data Risk",
      driver: "Missing Data Fields",
      points: 15,
      severity: "medium",
      explanation: `${missingFields.length} field(s) are missing: ${missingFields.join(", ")}.`,
    });
  }

  // ── Category 2: Property Risk (25%) ──
  if (input.propertyType === "vacant_land" || input.propertyType === null) {
    penalties.push({
      category: "Property Risk",
      driver: input.propertyType === "vacant_land" ? "Vacant Land" : "Unknown Property Type",
      points: input.propertyType === "vacant_land" ? 20 : 10,
      severity: input.propertyType === "vacant_land" ? "high" : "medium",
      explanation: input.propertyType === "vacant_land"
        ? "Vacant land carries higher liquidity risk and may lack road access or utilities."
        : "Property type is unknown, limiting condition and value assessment.",
    });
  }
  if (input.propertyType === "commercial" || input.propertyType === "industrial") {
    penalties.push({
      category: "Property Risk",
      driver: "Commercial/Industrial Property",
      points: 15,
      severity: "medium",
      explanation: "Commercial and industrial properties may have environmental risks, specialized buyer pools, and complex title issues.",
    });
  }
  if (input.propertyType === "agricultural") {
    penalties.push({
      category: "Property Risk",
      driver: "Agricultural Property",
      points: 10,
      severity: "low",
      explanation: "Agricultural properties have limited liquidity and specialized resale requirements.",
    });
  }

  // ── Category 3: Legal Risk (20%) ──
  const ownerLower = (input.ownerName ?? "").toLowerCase();
  if (ownerLower.includes("estate") || ownerLower.includes("deceased")) {
    penalties.push({
      category: "Legal Risk",
      driver: "Deceased Owner / Estate Signal",
      points: 25,
      severity: "high",
      explanation: "Estate ownership suggests heir complexity. Quiet title may be required, adding $3–8K+ in costs and 6–18 months.",
    });
  }
  if (ownerLower.includes("llc") || ownerLower.includes("trust") || ownerLower.includes("corp")) {
    penalties.push({
      category: "Legal Risk",
      driver: "Entity Ownership",
      points: 10,
      severity: "low",
      explanation: "Entity-owned property adds chain of title complexity and may require additional research.",
    });
  }
  if (input.auctionType === "lien") {
    penalties.push({
      category: "Legal Risk",
      driver: "Tax Lien — Redemption Risk",
      points: 8,
      severity: "low",
      explanation: `Tax lien states allow owners to redeem. Redemption period: ${input.redemptionPeriod ?? "unknown"}. Verify before investing capital.`,
    });
  }

  // ── Category 4: Auction Risk (15%) ──
  if (!input.auctionType || input.auctionType === "unknown") {
    penalties.push({
      category: "Auction Risk",
      driver: "Auction Type Unknown",
      points: 20,
      severity: "high",
      explanation: "Cannot determine if this is a lien or deed sale. Legal rights and title process differ significantly.",
    });
  }

  // ── Category 5: Liquidity Risk (10%) ──
  if (input.assessedValue && input.assessedValue < 10000) {
    penalties.push({
      category: "Liquidity Risk",
      driver: "Very Low Assessed Value",
      points: 20,
      severity: "high",
      explanation: `Assessed value of ${formatUSD(input.assessedValue)} is below $10,000. Micro-value properties have extremely thin resale markets.`,
    });
  } else if (input.assessedValue && input.assessedValue < 30000) {
    penalties.push({
      category: "Liquidity Risk",
      driver: "Low Assessed Value",
      points: 10,
      severity: "medium",
      explanation: `Assessed value of ${formatUSD(input.assessedValue)} is low. Buyer pool and resale liquidity may be limited.`,
    });
  }

  // ── Category 6: Valuation Risk (10%) ──
  if (!input.assessedValue) {
    penalties.push({
      category: "Valuation Risk",
      driver: "No Assessed Value",
      points: 40,
      severity: "critical",
      explanation: "Without an assessed value, there is no basis for bid calculation. Cannot estimate returns or cap loss.",
    });
  }

  // Calculate composite score
  const totalPenalty = penalties.reduce((sum, p) => sum + p.points, 0);
  const rawRisk = Math.min(100, totalPenalty);
  const score = Math.round(rawRisk);

  // Sort by severity and pick top 3
  const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
  const topDrivers: RiskDriver[] = penalties
    .sort((a, b) => (severityOrder[b.severity] - severityOrder[a.severity]) || (b.points - a.points))
    .slice(0, 3)
    .map((p) => ({
      driver: p.driver,
      category: p.category,
      severity: p.severity,
      explanation: p.explanation,
    }));

  let band: RiskBand;
  let label: string;

  if (score <= 30) {
    band = "green";
    label = "Low Risk";
  } else if (score <= 60) {
    band = "yellow";
    label = "Moderate Risk";
  } else if (score <= 80) {
    band = "orange";
    label = "Elevated Risk";
  } else if (score <= 95) {
    band = "red";
    label = "High Risk";
  } else {
    band = "black";
    label = "Severe Risk";
  }

  return { score, band, label, topDrivers };
}

// ─── MaxBid Calculation ──────────────────────────────────────────────────────

function calculateMaxBid(input: ScoringInput, dealRiskScore: number): number | null {
  if (!input.openingBid) return null;
  if (!input.assessedValue) return null;

  // Risk multiplier: higher risk = lower max bid relative to opening
  const riskMultiplier =
    dealRiskScore <= 30 ? 1.4 :
    dealRiskScore <= 60 ? 1.1 :
    dealRiskScore <= 80 ? 0.8 :
    0.5;

  // Conservative: cap at 70% of assessed value to protect equity
  const assessedCap = input.assessedValue * 0.70;
  const bidCeiling = input.openingBid * riskMultiplier;

  return Math.round(Math.min(bidCeiling, assessedCap));
}

// ─── Main Scoring Function ───────────────────────────────────────────────────

export function scoreParcel(input: ScoringInput): ScoringResult {
  const trustResult = calculateSourceTrustScore(input);
  const riskResult = calculateDealRiskScore(input, trustResult.missingFields);
  const maxBid = calculateMaxBid(input, riskResult.score);

  return {
    dealRiskScore: riskResult.score,
    sourceTrustScore: trustResult.score,
    maxBidAmount: maxBid,
    riskBand: riskResult.band,
    trustBand: trustResult.band as TrustBand,
    riskLabel: riskResult.label,
    trustLabel: trustResult.label,
    topRiskDrivers: riskResult.topDrivers,
    missingFieldsList: trustResult.missingFields,
  };
}

// ─── Display Helpers ─────────────────────────────────────────────────────────

export function getRiskBandColor(score: number): RiskBand {
  if (score <= 30) return "green";
  if (score <= 60) return "yellow";
  if (score <= 80) return "orange";
  if (score <= 95) return "red";
  return "black";
}

export function getRiskBandLabel(band: RiskBand): string {
  const labels: Record<RiskBand, string> = {
    green: "Low Risk",
    yellow: "Moderate Risk",
    orange: "Elevated Risk",
    red: "High Risk",
    black: "Severe Risk",
  };
  return labels[band];
}

export function getRiskBandClassName(band: RiskBand): string {
  const classes: Record<RiskBand, string> = {
    green: "risk-badge-green",
    yellow: "risk-badge-yellow",
    orange: "risk-badge-orange",
    red: "risk-badge-red",
    black: "risk-badge-red",
  };
  return classes[band];
}

export function getTrustBandColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#eab308";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
