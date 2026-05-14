import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Download, ExternalLink, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default async function ReportsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/dashboard");

  const reports = await prisma.report.findMany({
    where: { userId: user.id },
    include: {
      parcel: {
        select: {
          situsAddress: true,
          parcelId: true,
          county: true,
          state: true,
          score: { select: { dealRiskScore: true } },
        },
      },
    },
    orderBy: { generatedAt: "desc" },
  });

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 mb-1">Reports</h1>
          <p className="text-slate-400">
            {reports.length} investor brief{reports.length !== 1 ? "s" : ""} generated
          </p>
        </div>
        <Link href="/dashboard/upload">
          <Button size="sm">Upload New List</Button>
        </Link>
      </div>

      {/* Disclaimer */}
      <div
        className="rounded-lg border px-4 py-3 text-xs text-slate-500 mb-8"
        style={{ backgroundColor: "rgba(99,102,241,0.05)", borderColor: "rgba(99,102,241,0.2)" }}
      >
        ⚠️ All reports are for research support only. Not legal, tax, title, financial, or
        investment advice. Verify all data before bidding on any property.
      </div>

      {reports.length === 0 ? (
        <div className="card text-center py-16">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">No reports yet</h3>
          <p className="text-slate-500 mb-6">
            Generate investor briefs from your scored parcels.
          </p>
          <Link href="/dashboard/parcels">
            <Button>Go to Parcels</Button>
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: "#334155" }}>
            <FileText className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-300">All Investor Briefs</h2>
          </div>

          <div className="divide-y" style={{ borderColor: "#1e293b" }}>
            {reports.map((report) => {
              const riskScore = report.parcel.score?.dealRiskScore;
              return (
                <div
                  key={report.id}
                  className="flex items-center justify-between px-6 py-5 hover:bg-slate-800/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "rgba(99,102,241,0.12)" }}
                    >
                      <FileText className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        {report.title ??
                          report.parcel.situsAddress ??
                          report.parcel.parcelId ??
                          "Investor Brief"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {report.parcel.county}, {report.parcel.state} •{" "}
                        {formatDate(report.generatedAt)}
                        {riskScore !== undefined && riskScore !== null && (
                          <> • Risk score: {riskScore}</>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs rounded-full px-2.5 py-0.5 font-semibold capitalize"
                      style={{
                        backgroundColor:
                          report.status === "ready"
                            ? "rgba(34,197,94,0.12)"
                            : report.status === "failed"
                            ? "rgba(239,68,68,0.12)"
                            : "rgba(99,102,241,0.12)",
                        color:
                          report.status === "ready"
                            ? "#22c55e"
                            : report.status === "failed"
                            ? "#ef4444"
                            : "#818cf8",
                        border: `1px solid ${
                          report.status === "ready"
                            ? "rgba(34,197,94,0.3)"
                            : report.status === "failed"
                            ? "rgba(239,68,68,0.3)"
                            : "rgba(99,102,241,0.3)"
                        }`,
                      }}
                    >
                      {report.status}
                    </span>

                    <Link href={`/dashboard/parcels/${report.parcelId}`}>
                      <Button size="sm" variant="ghost">
                        <ArrowRight className="w-3.5 h-3.5 mr-1" />
                        View
                      </Button>
                    </Link>

                    {report.blobUrl && (
                      <a
                        href={report.blobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" variant="outline">
                          <Download className="w-3.5 h-3.5 mr-1" />
                          Download
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Methodology note */}
      <div
        className="mt-6 rounded-lg p-4 border text-xs text-slate-500 leading-relaxed"
        style={{ backgroundColor: "rgba(15,23,42,0.4)", borderColor: "#1e293b" }}
      >
        <p className="font-semibold text-slate-400 mb-1">Report Methodology</p>
        <p>
          ParcelGuard AI uses a proprietary scoring methodology. SourceTrust Score (0–100) measures
          data quality across multiple fields. DealRisk Score (0–100) evaluates six risk categories:
          data risk, property risk, legal/process risk, auction risk, liquidity risk, and valuation
          risk. Reports are generated using Claude AI and are for research purposes only.
        </p>
      </div>
    </div>
  );
}
