import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Upload,
  MapPin,
  BarChart3,
  FileText,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

async function getDashboardStats(userId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return null;

  const [totalParcels, scoredParcels, reports] = await Promise.all([
    prisma.parcel.count({ where: { userId: user.id } }),
    prisma.parcelScore.findMany({
      where: { parcel: { userId: user.id } },
      select: { dealRiskScore: true, maxBidAmount: true },
    }),
    prisma.report.count({ where: { userId: user.id } }),
  ]);

  const avgRisk =
    scoredParcels.length > 0
      ? Math.round(
          scoredParcels.reduce((s, p) => s + p.dealRiskScore, 0) / scoredParcels.length
        )
      : null;

  const topOpportunities = await prisma.parcel.findMany({
    where: {
      userId: user.id,
      score: { dealRiskScore: { lte: 30 } },
    },
    include: { score: true },
    orderBy: { score: { dealRiskScore: "asc" } },
    take: 5,
  });

  const recentParcels = await prisma.parcel.findMany({
    where: { userId: user.id },
    include: { score: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return { totalParcels, avgRisk, reports, topOpportunities, recentParcels, user };
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const stats = await getDashboardStats(userId);

  if (!stats) {
    return (
      <div className="p-8">
        <p className="text-slate-400">Setting up your account...</p>
      </div>
    );
  }

  const { totalParcels, avgRisk, reports, topOpportunities, recentParcels, user } = stats;

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 mb-1">Dashboard</h1>
          <p className="text-slate-400">
            Welcome back. Plan:{" "}
            <span
              className="rounded-full px-2 py-0.5 text-xs font-semibold capitalize"
              style={{ backgroundColor: "rgba(99,102,241,0.15)", color: "#818cf8" }}
            >
              {user.plan}
            </span>
          </p>
        </div>
        <Link href="/dashboard/upload">
          <Button>
            <Upload className="mr-2 w-4 h-4" />
            Upload Sale List
          </Button>
        </Link>
      </div>

      {/* Disclaimer */}
      <div
        className="rounded-lg border px-4 py-3 text-xs text-slate-500 mb-8"
        style={{ backgroundColor: "rgba(99,102,241,0.05)", borderColor: "rgba(99,102,241,0.2)" }}
      >
        ⚠️ For research support only. Not legal, tax, title, financial, or investment advice.
        Verify all data before bidding on any property.
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Parcels Uploaded",
            value: totalParcels.toString(),
            icon: MapPin,
            color: "#6366f1",
            sub: "total in system",
          },
          {
            label: "Avg Risk Score",
            value: avgRisk !== null ? `${avgRisk}/100` : "N/A",
            icon: BarChart3,
            color: avgRisk !== null
              ? avgRisk <= 30 ? "#22c55e"
              : avgRisk <= 60 ? "#eab308"
              : avgRisk <= 80 ? "#f97316"
              : "#ef4444"
              : "#64748b",
            sub: avgRisk !== null
              ? avgRisk <= 30 ? "Low risk portfolio"
              : avgRisk <= 60 ? "Moderate risk"
              : "Elevated risk"
              : "No scored parcels",
          },
          {
            label: "Top Opportunities",
            value: topOpportunities.length.toString(),
            icon: TrendingUp,
            color: "#22c55e",
            sub: "risk score ≤ 30",
          },
          {
            label: "Reports Generated",
            value: reports.toString(),
            icon: FileText,
            color: "#f59e0b",
            sub: "investor briefs",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-slate-400">{stat.label}</p>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <Icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
              </div>
              <p className="text-3xl font-bold mb-1" style={{ color: stat.color }}>
                {stat.value}
              </p>
              <p className="text-xs text-slate-500">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Opportunities */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              Top Opportunities
            </h2>
            <Link href="/dashboard/parcels?filter=low-risk" className="text-xs text-indigo-400 hover:text-indigo-300">
              View all →
            </Link>
          </div>

          {topOpportunities.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm mb-4">
                No low-risk parcels yet. Upload a sale list to get started.
              </p>
              <Link href="/dashboard/upload">
                <Button size="sm">Upload Sale List</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {topOpportunities.map((parcel) => (
                <Link
                  key={parcel.id}
                  href={`/dashboard/parcels/${parcel.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/50 transition-colors"
                  style={{ backgroundColor: "rgba(15,23,42,0.4)" }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {parcel.situsAddress ?? parcel.parcelId ?? "Unknown Address"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {parcel.county}, {parcel.state}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    {parcel.score && (
                      <>
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-semibold"
                          style={{
                            backgroundColor: "rgba(34,197,94,0.12)",
                            color: "#22c55e",
                            border: "1px solid rgba(34,197,94,0.3)",
                          }}
                        >
                          Risk {parcel.score.dealRiskScore}
                        </span>
                        {parcel.score.maxBidAmount && (
                          <span className="text-xs font-mono text-slate-400">
                            {formatCurrency(parcel.score.maxBidAmount)}
                          </span>
                        )}
                      </>
                    )}
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Parcels */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Recent Parcels
            </h2>
            <Link href="/dashboard/parcels" className="text-xs text-indigo-400 hover:text-indigo-300">
              View all →
            </Link>
          </div>

          {recentParcels.length === 0 ? (
            <div className="text-center py-8">
              <Upload className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm mb-4">
                Upload your first tax sale list to see parcels here.
              </p>
              <Link href="/dashboard/upload">
                <Button size="sm">Upload Sale List</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentParcels.map((parcel) => {
                const risk = parcel.score?.dealRiskScore;
                const riskStyle =
                  risk === undefined || risk === null
                    ? { bg: "rgba(99,102,241,0.1)", text: "#818cf8", border: "rgba(99,102,241,0.3)", label: "Unscored" }
                    : risk <= 30
                    ? { bg: "rgba(34,197,94,0.1)", text: "#22c55e", border: "rgba(34,197,94,0.3)", label: `Risk ${risk}` }
                    : risk <= 60
                    ? { bg: "rgba(234,179,8,0.1)", text: "#eab308", border: "rgba(234,179,8,0.3)", label: `Risk ${risk}` }
                    : risk <= 80
                    ? { bg: "rgba(249,115,22,0.1)", text: "#f97316", border: "rgba(249,115,22,0.3)", label: `Risk ${risk}` }
                    : { bg: "rgba(239,68,68,0.1)", text: "#ef4444", border: "rgba(239,68,68,0.3)", label: `Risk ${risk}` };

                return (
                  <Link
                    key={parcel.id}
                    href={`/dashboard/parcels/${parcel.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/50 transition-colors"
                    style={{ backgroundColor: "rgba(15,23,42,0.4)" }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-200 truncate">
                        {parcel.situsAddress ?? parcel.parcelId ?? "Unknown"}
                      </p>
                      <p className="text-xs text-slate-500 capitalize">
                        {parcel.propertyType ?? "Unknown type"} •{" "}
                        {parcel.auctionType ?? "Unknown auction"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold border"
                        style={{
                          backgroundColor: riskStyle.bg,
                          color: riskStyle.text,
                          borderColor: riskStyle.border,
                        }}
                      >
                        {riskStyle.label}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            href: "/dashboard/upload",
            icon: Upload,
            title: "Upload Sale List",
            description: "Import CSV, Excel, or PDF",
            color: "#6366f1",
          },
          {
            href: "/dashboard/parcels",
            icon: MapPin,
            title: "Browse Parcels",
            description: "Filter and sort by risk",
            color: "#22c55e",
          },
          {
            href: "/dashboard/reports",
            icon: FileText,
            title: "My Reports",
            description: "Download investor briefs",
            color: "#f59e0b",
          },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="card hover:border-indigo-500/30 transition-all group flex items-center gap-4"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${action.color}15` }}
              >
                <Icon className="w-5 h-5" style={{ color: action.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-100 group-hover:text-white">
                  {action.title}
                </p>
                <p className="text-xs text-slate-400">{action.description}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 flex-shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
