import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Shield,
  BarChart3,
  FileText,
  AlertCircle,
  Info,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { RiskGauge, TrustBadge } from "@/components/parcels/risk-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ScoreButton } from "./score-button";
import { ReportButton } from "./report-button";

export default async function ParcelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/dashboard");

  const parcel = await prisma.parcel.findFirst({
    where: { id, userId: user.id },
    include: {
      score: true,
      conflictFlags: { orderBy: { createdAt: "desc" } },
      reports: { orderBy: { generatedAt: "desc" }, take: 3 },
    },
  });

  if (!parcel) notFound();

  const severityConfig = {
    stop: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", icon: AlertCircle },
    alert: { color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.3)", icon: AlertTriangle },
    warn: { color: "#eab308", bg: "rgba(234,179,8,0.1)", border: "rgba(234,179,8,0.3)", icon: AlertTriangle },
    info: { color: "#6366f1", bg: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.3)", icon: Info },
  };

  const missingFields = Array.isArray(parcel.missingFields) 
    ? (parcel.missingFields as string[]) 
    : [];

  const topRiskDrivers = parcel.score?.topRiskDrivers as Array<{
    driver: string;
    category: string;
    severity: string;
    explanation: string;
  }> | null;

  const bidReadyChecklist = [
    {
      category: "Data Verification",
      items: [
        {
          label: "Confirm parcel ID with county assessor",
          done: !!parcel.parcelId,
          critical: true,
        },
        {
          label: "Verify situs address matches county records",
          done: !!parcel.situsAddress,
          critical: true,
        },
        {
          label: "Confirm owner name and entity type",
          done: !!parcel.ownerName,
          critical: false,
        },
        {
          label: "Verify assessed value is current",
          done: !!parcel.assessedValue,
          critical: true,
        },
      ],
    },
    {
      category: "Legal Research",
      items: [
        {
          label: "Check for senior liens (federal tax, HOA, municipal)",
          done: false,
          critical: true,
        },
        {
          label: "Verify auction type and title transfer process",
          done: !!parcel.auctionType,
          critical: true,
        },
        {
          label: "Confirm redemption period and deadline",
          done: !!parcel.redemptionPeriod,
          critical: parcel.auctionType === "lien",
        },
        {
          label: "Research title chain and quiet title need",
          done: false,
          critical: false,
        },
      ],
    },
    {
      category: "Property Due Diligence",
      items: [
        {
          label: "Drive by or virtual inspection of property",
          done: false,
          critical: false,
        },
        {
          label: "Check flood zone status (FEMA FIRM maps)",
          done: false,
          critical: false,
        },
        {
          label: "Verify road access / landlocked status",
          done: false,
          critical: parcel.propertyType === "vacant_land",
        },
        {
          label: "Check for code violations or demolition orders",
          done: false,
          critical: false,
        },
      ],
    },
    {
      category: "Auction Preparation",
      items: [
        {
          label: "Confirm property is still in the sale",
          done: false,
          critical: true,
        },
        {
          label: "Verify payment deadline and accepted methods",
          done: false,
          critical: true,
        },
        {
          label: "Set hard bid ceiling (do not exceed MaxBid)",
          done: !!parcel.score?.maxBidAmount,
          critical: true,
        },
        {
          label: "Consult with licensed attorney if needed",
          done: false,
          critical: false,
        },
      ],
    },
  ];

  return (
    <div className="p-8 max-w-6xl">
      {/* Back */}
      <Link
        href="/dashboard/parcels"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Parcels
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1">
            {parcel.situsAddress ?? parcel.parcelId ?? "Unknown Property"}
          </h1>
          <p className="text-slate-400">
            {parcel.county}, {parcel.state} •{" "}
            <span className="capitalize">{parcel.propertyType?.replace(/_/g, " ") ?? "Unknown type"}</span>{" "}
            •{" "}
            <span className="capitalize">{parcel.auctionType ?? "Unknown auction"}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ScoreButton parcelId={parcel.id} hasScore={!!parcel.score} />
          <ReportButton parcelId={parcel.id} />
        </div>
      </div>

      {/* Disclaimer */}
      <div
        className="rounded-lg border px-4 py-3 text-xs text-slate-500 mb-6"
        style={{ backgroundColor: "rgba(99,102,241,0.05)", borderColor: "rgba(99,102,241,0.2)" }}
      >
        ⚠️ AI-generated analysis. Not legal, tax, title, financial, or investment advice. Verify all
        data with the applicable county, auction provider, title professional, and licensed attorney
        before bidding on any property.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Score summary */}
          {parcel.score ? (
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-100 mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                Risk Assessment
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {/* DealRisk Gauge */}
                <div className="col-span-2 flex flex-col items-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                    DealRisk Score
                  </p>
                  <RiskGauge score={parcel.score.dealRiskScore} size="lg" />
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    Higher = more risk
                  </p>
                </div>

                {/* SourceTrust */}
                <div className="flex flex-col items-center justify-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                    SourceTrust
                  </p>
                  <p
                    className="text-4xl font-bold mb-2"
                    style={{
                      color: parcel.score.sourceTrustScore >= 80 ? "#22c55e"
                        : parcel.score.sourceTrustScore >= 60 ? "#eab308"
                        : parcel.score.sourceTrustScore >= 40 ? "#f97316"
                        : "#ef4444",
                    }}
                  >
                    {parcel.score.sourceTrustScore}
                  </p>
                  <TrustBadge score={parcel.score.sourceTrustScore} showScore={false} />
                </div>

                {/* MaxBid */}
                <div className="flex flex-col items-center justify-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                    MaxBid Guardrail
                  </p>
                  <p className="text-2xl font-bold text-amber-400 mb-2">
                    {parcel.score.maxBidAmount
                      ? formatCurrency(parcel.score.maxBidAmount)
                      : "N/A"}
                  </p>
                  <p className="text-xs text-slate-500 text-center">do not exceed</p>
                </div>
              </div>

              {/* MaxBid disclaimer */}
              <div
                className="rounded-lg p-3 text-xs text-slate-500 mb-4"
                style={{ backgroundColor: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)" }}
              >
                MaxBid figures are estimates based on limited available data. Not an appraisal,
                valuation, or investment recommendation. Do not bid based solely on this estimate.
              </div>

              {/* Top risk drivers */}
              {topRiskDrivers && topRiskDrivers.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">
                    Top Risk Drivers
                  </h3>
                  <div className="space-y-3">
                    {topRiskDrivers.map((driver, i) => {
                      const severityColor =
                        driver.severity === "critical" ? "#ef4444"
                        : driver.severity === "high" ? "#f97316"
                        : driver.severity === "medium" ? "#eab308"
                        : "#6366f1";

                      return (
                        <div
                          key={i}
                          className="rounded-lg p-3 border"
                          style={{
                            backgroundColor: `${severityColor}08`,
                            borderColor: `${severityColor}25`,
                          }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="text-xs font-bold uppercase"
                              style={{ color: severityColor }}
                            >
                              {driver.severity}
                            </span>
                            <span className="text-xs text-slate-500">{driver.category}</span>
                          </div>
                          <p className="text-sm font-semibold text-slate-200 mb-1">
                            {driver.driver}
                          </p>
                          <p className="text-xs text-slate-400">{driver.explanation}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card text-center py-10">
              <BarChart3 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-300 mb-2">Not Yet Scored</h3>
              <p className="text-slate-400 text-sm mb-4">
                Click &quot;Generate Score&quot; to run AI risk analysis on this parcel.
              </p>
              <ScoreButton parcelId={parcel.id} hasScore={false} />
            </div>
          )}

          {/* AI Narrative */}
          {parcel.score?.aiNarrative && (
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                AI Risk Narrative
              </h2>
              <div className="prose prose-invert prose-sm max-w-none">
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                  {parcel.score.aiNarrative}
                </p>
              </div>
              <div
                className="mt-4 rounded-lg p-3 text-xs text-slate-500"
                style={{ backgroundColor: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.15)" }}
              >
                ⚠️ AI-generated analysis. Not legal, tax, title, financial, or investment advice.
              </div>
            </div>
          )}

          {/* ConflictRadar */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              ConflictRadar
            </h2>

            {parcel.conflictFlags.length === 0 ? (
              <div className="flex items-center gap-3 text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm">No conflicts detected in uploaded data</span>
              </div>
            ) : (
              <div className="space-y-3">
                {parcel.conflictFlags.map((flag) => {
                  const sev = flag.severity as keyof typeof severityConfig;
                  const config = severityConfig[sev] ?? severityConfig.info;
                  const Icon = config.icon;

                  return (
                    <div
                      key={flag.id}
                      className="rounded-lg p-4 border"
                      style={{ backgroundColor: config.bg, borderColor: config.border }}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: config.color }} />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-slate-200">
                              {flag.title}
                            </span>
                            <span
                              className="text-xs font-bold uppercase rounded px-1.5"
                              style={{ backgroundColor: config.bg, color: config.color }}
                            >
                              {flag.severity}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300">{flag.description}</p>
                          {flag.whatToDo && (
                            <p className="text-xs text-slate-400 mt-2">
                              <span className="font-semibold text-slate-300">Action: </span>
                              {flag.whatToDo}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* BidReady Checklist */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              BidReady Checklist
            </h2>
            <p className="text-sm text-slate-400 mb-5">
              Complete this checklist before bidding. Each item represents a critical due diligence
              step.
            </p>

            <div className="space-y-6">
              {bidReadyChecklist.map((section) => (
                <div key={section.category}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                    {section.category}
                  </h3>
                  <div className="space-y-2">
                    {section.items.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-start gap-3 p-3 rounded-lg"
                        style={{ backgroundColor: "rgba(15,23,42,0.4)" }}
                      >
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border"
                          style={{
                            backgroundColor: item.done ? "rgba(34,197,94,0.15)" : "transparent",
                            borderColor: item.done ? "#22c55e" : "#475569",
                          }}
                        >
                          {item.done && <CheckCircle2 className="w-3 h-3 text-green-400" />}
                        </div>
                        <div className="flex-1">
                          <span
                            className="text-sm"
                            style={{ color: item.done ? "#94a3b8" : "#e2e8f0" }}
                          >
                            {item.label}
                          </span>
                          {item.critical && !item.done && (
                            <span
                              className="ml-2 text-xs font-semibold rounded px-1.5 py-0.5"
                              style={{
                                backgroundColor: "rgba(239,68,68,0.12)",
                                color: "#f87171",
                              }}
                            >
                              REQUIRED
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Parcel details */}
        <div className="space-y-6">
          {/* Summary card */}
          <div className="card">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
              Parcel Details
            </h2>

            <div className="space-y-3">
              {[
                { label: "Parcel ID", value: parcel.parcelId },
                { label: "Address", value: parcel.situsAddress },
                { label: "City / Zip", value: [parcel.city, parcel.zip].filter(Boolean).join(", ") || null },
                { label: "County", value: parcel.county },
                { label: "State", value: parcel.state },
                { label: "Owner", value: parcel.ownerName },
                { label: "Property Type", value: parcel.propertyType?.replace(/_/g, " ") },
                { label: "Legal Description", value: parcel.legalDescription },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex flex-col gap-0.5 pb-3 border-b last:border-0"
                  style={{ borderColor: "#1e293b" }}
                >
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className="text-sm text-slate-200 capitalize">
                    {value ?? (
                      <span className="text-amber-500 text-xs">⚠ Missing — verify</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial data */}
          <div className="card">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
              Financial Data
            </h2>

            <div className="space-y-3">
              {[
                { label: "Assessed Value", value: formatCurrency(parcel.assessedValue), mono: true },
                { label: "Tax Amount Owed", value: formatCurrency(parcel.taxAmountOwed), mono: true },
                { label: "Opening Bid", value: formatCurrency(parcel.openingBid), mono: true },
                {
                  label: "MaxBid Guardrail",
                  value: parcel.score?.maxBidAmount
                    ? formatCurrency(parcel.score.maxBidAmount)
                    : "Score required",
                  mono: true,
                  accent: true,
                },
              ].map(({ label, value, mono, accent }) => (
                <div
                  key={label}
                  className="flex justify-between items-center pb-3 border-b last:border-0"
                  style={{ borderColor: "#1e293b" }}
                >
                  <span className="text-xs text-slate-500">{label}</span>
                  <span
                    className={mono ? "font-mono text-sm" : "text-sm"}
                    style={{ color: accent ? "#f59e0b" : "#e2e8f0" }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Auction data */}
          <div className="card">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
              Auction Data
            </h2>

            <div className="space-y-3">
              {[
                { label: "Auction Type", value: parcel.auctionType },
                { label: "Auction Platform", value: parcel.auctionPlatform },
                { label: "Sale Date", value: formatDate(parcel.saleDate) },
                { label: "Redemption Period", value: parcel.redemptionPeriod },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex flex-col gap-0.5 pb-3 border-b last:border-0"
                  style={{ borderColor: "#1e293b" }}
                >
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className="text-sm text-slate-200 capitalize">
                    {value ?? (
                      <span className="text-amber-500 text-xs">⚠ Unknown</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Missing fields */}
          {missingFields.length > 0 && (
            <div
              className="card border"
              style={{ borderColor: "rgba(245,158,11,0.3)", backgroundColor: "rgba(245,158,11,0.05)" }}
            >
              <h2 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Missing Fields
              </h2>
              <div className="flex flex-wrap gap-2">
                {missingFields.map((field: string) => (
                  <span
                    key={field}
                    className="text-xs font-mono rounded px-2 py-1"
                    style={{
                      backgroundColor: "rgba(245,158,11,0.1)",
                      color: "#f59e0b",
                      border: "1px solid rgba(245,158,11,0.25)",
                    }}
                  >
                    {field}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Verify these fields with the county assessor before bidding.
              </p>
            </div>
          )}

          {/* Reports */}
          {parcel.reports.length > 0 && (
            <div className="card">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Generated Reports
              </h2>
              <div className="space-y-2">
                {parcel.reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: "rgba(15,23,42,0.4)" }}
                  >
                    <div>
                      <p className="text-sm text-slate-300">
                        {report.title ?? "Investor Brief"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(report.generatedAt)}
                      </p>
                    </div>
                    {report.blobUrl && (
                      <a
                        href={report.blobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-400 hover:text-indigo-300"
                      >
                        Download
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            className="rounded-lg p-3 text-xs text-slate-500 leading-relaxed"
            style={{ backgroundColor: "rgba(15,23,42,0.4)", border: "1px solid #1e293b" }}
          >
            Source: {parcel.sourceFileName ?? "Uploaded file"} •{" "}
            Uploaded {formatDate(parcel.uploadDate)}
          </div>
        </div>
      </div>
    </div>
  );
}
