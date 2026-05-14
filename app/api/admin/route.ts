import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function checkAuth(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '').trim()
  return token === process.env.ADMIN_TOKEN
}

// GET /api/admin — system overview
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized()

  const [userCount, parcelCount, reportCount, recentUsers, recentParcels] = await Promise.all([
    prisma.user.count(),
    prisma.parcel.count(),
    prisma.report.count(),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, email: true, name: true, createdAt: true, plan: true },
    }),
    prisma.parcel.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, address: true, status: true, createdAt: true, userId: true },
    }),
  ])

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    stats: {
      users: userCount,
      parcels: parcelCount,
      reports: reportCount,
    },
    recentUsers,
    recentParcels,
  })
}
