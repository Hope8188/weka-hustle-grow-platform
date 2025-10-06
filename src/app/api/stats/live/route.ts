import { db } from "@/db"
import { serviceRequests, user, services } from "@/db/schema"
import { sql, gt, and, eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    // Count service requests in last 24h
    const recentRequests = await db
      .select({ count: sql<number>`count(*)` })
      .from(serviceRequests)
      .where(gt(serviceRequests.createdAt, twentyFourHoursAgo))
    
    // Count active providers (users with at least one service)
    const activeProviders = await db
      .select({ count: sql<number>`count(distinct ${services.userId})` })
      .from(services)
    
    // Get total users count
    const totalUsers = await db
      .select({ count: sql<number>`count(*)` })
      .from(user)
    
    // Calculate avg response time (mock for now - can be enhanced later)
    const avgResponseMinutes = 12 // Mock value - in real app, calculate from actual data
    
    return NextResponse.json({
      requestsLast24h: Number(recentRequests[0]?.count || 0),
      activeProviders: Number(activeProviders[0]?.count || 0),
      totalUsers: Number(totalUsers[0]?.count || 0),
      avgResponseMinutes,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error("Failed to fetch live stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}