import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { serviceRequests, services, userProfiles } from '@/db/schema';
import { eq, desc, sql, or, and, like } from 'drizzle-orm';
import { notificationService } from '@/lib/notifications';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single service request by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const serviceRequest = await db.select()
        .from(serviceRequests)
        .where(eq(serviceRequests.id, parseInt(id)))
        .limit(1);

      if (serviceRequest.length === 0) {
        return NextResponse.json({ error: 'Service request not found' }, { status: 404 });
      }

      // Check if request is matched/completed and user is not the matched provider
      const record = serviceRequest[0];
      if ((record.status === 'matched' || record.status === 'completed') && record.matchedProviderId) {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user || session.user.id !== record.matchedProviderId) {
          return NextResponse.json({ error: 'Service request not found' }, { status: 404 });
        }
      }

      return NextResponse.json(serviceRequest[0]);
    }

    // List service requests with filters
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const location = searchParams.get('location');

    // Get current user session for filtering matched requests
    const session = await auth.api.getSession({ headers: request.headers });
    const currentUserId = session?.user?.id;

    // Build where conditions
    const conditions = [];

    // Status filter
    if (status) {
      conditions.push(eq(serviceRequests.status, status));
    } else {
      // Default: show only open requests to public
      if (!currentUserId) {
        conditions.push(eq(serviceRequests.status, 'open'));
      }
    }

    // If authenticated and no status filter, show open + user's matched requests
    if (currentUserId && !status) {
      conditions.push(
        or(
          eq(serviceRequests.status, 'open'),
          eq(serviceRequests.matchedProviderId, currentUserId)
        )
      );
    }

    // Category filter (exact match)
    if (category) {
      conditions.push(eq(serviceRequests.serviceCategory, category));
    }

    // Location filter (LIKE match)
    if (location) {
      conditions.push(like(serviceRequests.customerLocation, `%${location}%`));
    }

    // Build and execute query
    let query = db.select().from(serviceRequests);
    
    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }

    const results = await query
      .orderBy(desc(serviceRequests.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { 
      customerName, 
      customerPhone, 
      customerLocation, 
      serviceCategory, 
      description, 
      budget 
    } = data;

    if (!customerName || !customerPhone || !customerLocation || !serviceCategory || !description) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Create service request
    const result = await db.insert(serviceRequests).values({
      customerName,
      customerPhone,
      customerLocation,
      serviceCategory,
      description,
      budget: budget || null,
      status: 'open',
      createdAt: new Date().toISOString(),
    }).returning();

    const newRequest = result[0];

    // Find matching service providers
    const matchingProviders = await db.select({
      userId: services.userId,
      serviceName: services.name,
      phone: sql<string>`(SELECT phone FROM user WHERE user.id = ${services.userId})`
    })
      .from(services)
      .where(eq(services.category, serviceCategory))
      .limit(5);

    // Send notifications to matching providers
    for (const provider of matchingProviders) {
      if (provider.phone) {
        await notificationService.notifyServiceMatch(
          provider.phone,
          customerName,
          serviceCategory,
          customerLocation
        );
      }
    }

    // Send confirmation to customer
    await notificationService.notifyCustomerRequestReceived(
      customerPhone,
      serviceCategory
    );

    return NextResponse.json({
      success: true,
      request: newRequest,
      message: 'Request submitted successfully! Providers will contact you soon.',
      matchedProviders: matchingProviders.length
    });
  } catch (error) {
    console.error('Error creating service request:', error);
    return NextResponse.json(
      { error: 'Failed to create service request' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const body = await request.json();
    const { status, matchedProviderId, matchedAt } = body;

    // Check if authentication is required for this operation
    const requiresAuth = matchedProviderId || (status && status !== 'open');

    if (requiresAuth) {
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session?.user) {
        return NextResponse.json({ 
          error: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED' 
        }, { status: 401 });
      }
    }

    // Check if record exists
    const existing = await db.select()
      .from(serviceRequests)
      .where(eq(serviceRequests.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 });
    }

    // Build update object
    const updates: any = {};

    if (status !== undefined) {
      const validStatuses = ['open', 'matched', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ 
          error: "Invalid status. Must be one of: open, matched, completed, cancelled",
          code: "INVALID_STATUS" 
        }, { status: 400 });
      }
      updates.status = status;
    }

    if (matchedProviderId !== undefined) {
      updates.matchedProviderId = matchedProviderId;
      updates.matchedAt = new Date().toISOString();
      if (!updates.status) {
        updates.status = 'matched';
      }
    }

    // Validate status transitions
    if (updates.status === 'matched') {
      if (!updates.matchedProviderId && !existing[0].matchedProviderId) {
        return NextResponse.json({ 
          error: "Cannot set status to 'matched' without a matched provider",
          code: "INVALID_STATUS_TRANSITION" 
        }, { status: 400 });
      }
    }

    if (matchedAt !== undefined) {
      updates.matchedAt = matchedAt;
    }

    const updated = await db.update(serviceRequests)
      .set(updates)
      .where(eq(serviceRequests.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Authentication required for DELETE
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    // Check if record exists
    const existing = await db.select()
      .from(serviceRequests)
      .where(eq(serviceRequests.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 });
    }

    const record = existing[0];

    // Only allow deletion if status is 'open' or user is the matched provider
    const canDelete = record.status === 'open' || record.matchedProviderId === session.user.id;

    if (!canDelete) {
      return NextResponse.json({ 
        error: 'You do not have permission to delete this service request',
        code: 'UNAUTHORIZED_DELETE' 
      }, { status: 401 });
    }

    const deleted = await db.delete(serviceRequests)
      .where(eq(serviceRequests.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Service request deleted successfully',
      deletedRecord: deleted[0] 
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}