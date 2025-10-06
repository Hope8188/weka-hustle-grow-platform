import { NextResponse } from 'next/server';
import { db } from '@/db';
import { serviceRequests, services, user } from '@/db/schema';
import { sql, and, isNotNull } from 'drizzle-orm';

export async function GET() {
  try {
    // Count requests in last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const requestsLast24h = await db
      .select({ count: sql<number>`count(*)` })
      .from(serviceRequests)
      .where(sql`${serviceRequests.createdAt} >= ${twentyFourHoursAgo}`);

    // Count active providers (users who have at least one service)
    const activeProviders = await db
      .select({ count: sql<number>`count(distinct ${services.userId})` })
      .from(services);

    // Count total users
    const totalUsers = await db
      .select({ count: sql<number>`count(*)` })
      .from(user);

    // Calculate average response time from actual data (only completed/matched requests with response_time)
    const avgResponse = await db
      .select({ avg: sql<number>`avg(${serviceRequests.responseTime})` })
      .from(serviceRequests)
      .where(
        and(
          isNotNull(serviceRequests.responseTime),
          sql`${serviceRequests.responseTime} > 0`
        )
      );

    const avgResponseMinutes = Math.round(avgResponse[0]?.avg || 12);

    return NextResponse.json({
      requestsLast24h: requestsLast24h[0]?.count || 0,
      activeProviders: activeProviders[0]?.count || 0,
      totalUsers: totalUsers[0]?.count || 0,
      avgResponseMinutes,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({
      requestsLast24h: 0,
      activeProviders: 0,
      totalUsers: 0,
      avgResponseMinutes: 12,
      lastUpdated: new Date().toISOString()
    }, { status: 500 });
  }
}