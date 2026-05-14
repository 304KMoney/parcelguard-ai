import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ parcels: [] });

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter");
  const q = searchParams.get("q");
  const sort = searchParams.get("sort");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 200);

  type WhereClause = {
    userId: string;
    score?: { dealRiskScore?: { lte?: number; gte?: number } };
    OR?: Array<{
      situsAddress?: { contains: string; mode: "insensitive" };
      parcelId?: { contains: string; mode: "insensitive" };
      ownerName?: { contains: string; mode: "insensitive" };
    }>;
  };

  const where: WhereClause = { userId: user.id };

  if (filter === "low-risk") where.score = { dealRiskScore: { lte: 30 } };
  else if (filter === "high-risk") where.score = { dealRiskScore: { gte: 75 } };

  if (q) {
    where.OR = [
      { situsAddress: { contains: q, mode: "insensitive" } },
      { parcelId: { contains: q, mode: "insensitive" } },
      { ownerName: { contains: q, mode: "insensitive" } },
    ];
  }

  const parcels = await prisma.parcel.findMany({
    where,
    include: { score: true },
    orderBy:
      sort === "risk-asc"
        ? { score: { dealRiskScore: "asc" } }
        : sort === "risk-desc"
        ? { score: { dealRiskScore: "desc" } }
        : { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ parcels });
}
