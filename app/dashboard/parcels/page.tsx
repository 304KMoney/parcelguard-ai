import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Search, MapPin, Filter } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RiskBadge, TrustBadge } from "@/components/parcels/risk-badge";
import { Button } from "@/components/ui/button";

interface SearchParams {
  filter?: string;
  sort?: string;
  q?: string;
  state?: string;
}

export default async function ParcelsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const params = await searchParams;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/dashboard");

  // Build filter
  type ParcelWhereClause = {
    userId: string;
    state?: string;
    score?: {
      dealRiskScore?: { lte?: number; gte?: number };
    };
    OR?: Array<{
      situsAddress?: { contains: string; mode: "insensitive" };
      parcelId?: { contains: string; mode: "insensitive" };
      ownerName?: { contains: string; mode: "insensitive" };
      county?: { contains: string; mode: "insensitive" };
    }>;
  };

  const where: ParcelWhereClause = { userId: user.id };

  if (params.state) where.state = params.state;

  if (params.filter === "low-risk") {
    where.score = { dealRiskScore: { lte: 30 } };
  } else if (params.filter === "high-risk") {
    where.score = { dealRiskScore: { gte: 75 } };
  } else if (params.filter === "unscored") {
    // will handle below
  }

  if (params.q) {
    where.OR = [
      { situsAddress: { contains: params.q, mode: "insensitive" } },
      { parcelId: { contains: params.q, mode: "insensitive" } },
      { ownerName: { contains: params.q, mode: "insensitive" } },
      { county: { contains: params.q, mode: "insensitive" } },
    ];
  }

  const parcels = await prisma.parcel.findMany({
    where,
    include: { score: true, conflictFlags: { take: 1, orderBy: { createdAt: "desc" } } },
    orderBy:
      params.sort === "risk-asc"
        ? { score: { dealRiskScore: "asc" } }
        : params.sort === "risk-desc"
        ? { score: { dealRiskScore: "desc" } }
        : { createdAt: "desc" },
    take: 100,
  });

  const states = await prisma.parcel.findMany({
    where: { userId: user.id },
    select: { state: true },
    distinct: ["state"],
  });

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 mb-1">Parcels</h1>
          <p className="text-slate-400">{parcels.length} parcel{parcels.length !== 1 ? "s" : ""} found</p>
        </div>
        <Link href="/dashboard/upload">
          <Button size="sm">Upload More</Button>
        </Link>
      </div>

      {/* Disclaimer */}
      <div
        className="rounded-lg border px-4 py-3 text-xs text-slate-500 mb-6"
        style={{ backgroundColor: "rgba(99,102,241,0.05)", borderColor: "rgba(99,102,241,0.2)" }}
      >
        ⚠️ Research support only. Not investment advice. Verify all data before bidding.
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <form className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              name="q"
              defaultValue={params.q}
              placeholder="Search address, parcel ID, owner..."
              className="pl-9 pr-4 py-2 rounded-lg border text-sm w-64 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              style={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f1f5f9" }}
            />
          </div>
          <Button type="submit" size="sm" variant="outline">
            <Search className="w-3.5 h-3.5" />
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          {[
            { label: "All", value: "" },
            { label: "Low Risk", value: "low-risk" },
            { label: "High Risk", value: "high-risk" },
          ].map((f) => (
            <Link
              key={f.value}
              href={`/dashboard/parcels?filter=${f.value}`}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={
                (params.filter ?? "") === f.value
                  ? { backgroundColor: "#6366f1", color: "#fff" }
                  : { backgroundColor: "#1e293b", color: "#94a3b8", border: "1px solid #334155" }
              }
            >
              {f.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-slate-500">Sort:</span>
          {[
            { label: "Newest", value: "" },
            { label: "Risk ↑", value: "risk-asc" },
            { label: "Risk ↓", value: "risk-desc" },
          ].map((s) => (
            <Link
              key={s.value}
              href={`/dashboard/parcels?sort=${s.value}${params.filter ? `&filter=${params.filter}` : ""}`}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={
                (params.sort ?? "") === s.value
                  ? { backgroundColor: "#6366f1", color: "#fff" }
                  : { backgroundColor: "#1e293b", color: "#94a3b8", border: "1px solid #334155" }
              }
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      {parcels.length === 0 ? (
        <div className="card text-center py-16">
          <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">No parcels found</h3>
          <p className="text-slate-500 mb-6">
            {params.q
              ? `No results for "${params.q}"`
              : "Upload a county tax sale list to get started."}
          </p>
          <Link href="/dashboard/upload">
            <Button>Upload Sale List</Button>
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b text-left" style={{ borderColor: "#334155" }}>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Address / Parcel ID
                  </th>
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Type
                  </th>
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Assessed Value
                  </th>
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Opening Bid
                  </th>
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    DealRisk
                  </th>
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    SourceTrust
                  </th>
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    MaxBid
                  </th>
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Flags
                  </th>
                  <th className="px-4 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {parcels.map((parcel, i) => (
                  <tr
                    key={parcel.id}
                    className="border-b hover:bg-slate-800/30 transition-colors"
                    style={{ borderColor: "#1e293b", backgroundColor: i % 2 === 1 ? "rgba(15,23,42,0.2)" : "transparent" }}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-200 truncate max-w-[200px]">
                          {parcel.situsAddress ?? parcel.parcelId ?? "—"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {parcel.county}, {parcel.state} • {formatDate(parcel.uploadDate)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-slate-400 capitalize">
                        {parcel.propertyType?.replace(/_/g, " ") ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm font-mono text-slate-300">
                      {formatCurrency(parcel.assessedValue)}
                    </td>
                    <td className="px-4 py-4 text-sm font-mono text-slate-300">
                      {formatCurrency(parcel.openingBid)}
                    </td>
                    <td className="px-4 py-4">
                      {parcel.score ? (
                        <RiskBadge score={parcel.score.dealRiskScore} size="sm" />
                      ) : (
                        <span className="text-xs text-slate-600">Unscored</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {parcel.score ? (
                        <TrustBadge score={parcel.score.sourceTrustScore} showScore={false} />
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm font-mono text-slate-300">
                      {parcel.score?.maxBidAmount
                        ? formatCurrency(parcel.score.maxBidAmount)
                        : "—"}
                    </td>
                    <td className="px-4 py-4">
                      {parcel.conflictFlags.length > 0 ? (
                        <span
                          className="text-xs rounded-full px-2 py-0.5 font-semibold"
                          style={{
                            backgroundColor: "rgba(239,68,68,0.12)",
                            color: "#f87171",
                            border: "1px solid rgba(239,68,68,0.3)",
                          }}
                        >
                          {parcel.conflictFlags.length} flag{parcel.conflictFlags.length !== 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600">None</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/dashboard/parcels/${parcel.id}`}>
                        <Button size="sm" variant="ghost">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* State filter sidebar hint */}
      {states.length > 1 && (
        <p className="text-xs text-slate-500 mt-4">
          Parcels from {states.length} states:{" "}
          {states.map((s) => s.state).filter(Boolean).join(", ")}
        </p>
      )}
    </div>
  );
}
