import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { services } from '@/db/schema';
import { eq, and, like, or, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

async function getAuthenticatedUser(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  
  if (!session?.user?.id) {
    return null;
  }
  
  return session.user;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const service = await db
        .select()
        .from(services)
        .where(and(eq(services.id, parseInt(id)), eq(services.userId, user.id)))
        .limit(1);

      if (service.length === 0) {
        return NextResponse.json(
          { error: 'Service not found', code: 'SERVICE_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(service[0]);
    }

    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    let query = db.select().from(services).where(eq(services.userId, user.id));

    const conditions = [eq(services.userId, user.id)];

    if (search) {
      conditions.push(
        or(
          like(services.serviceName, `%${search}%`),
          like(services.description, `%${search}%`)
        )!
      );
    }

    if (status) {
      conditions.push(eq(services.status, status));
    }

    query = db
      .select()
      .from(services)
      .where(and(...conditions))
      .orderBy(desc(services.createdAt))
      .limit(limit)
      .offset(offset);

    const results = await query;

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const serviceName = body.serviceName?.trim();
    const description = body.description?.trim() || null;
    const price = body.price;
    const status = body.status?.trim() || 'active';

    if (!serviceName) {
      return NextResponse.json(
        {
          error: 'Service name is required',
          code: 'MISSING_SERVICE_NAME',
        },
        { status: 400 }
      );
    }

    if (price === undefined || price === null) {
      return NextResponse.json(
        { error: 'Price is required', code: 'MISSING_PRICE' },
        { status: 400 }
      );
    }

    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json(
        {
          error: 'Price must be a positive number',
          code: 'INVALID_PRICE',
        },
        { status: 400 }
      );
    }

    if (status !== 'active' && status !== 'inactive') {
      return NextResponse.json(
        {
          error: 'Status must be either "active" or "inactive"',
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const newService = await db
      .insert(services)
      .values({
        userId: user.id,
        serviceName,
        description,
        price,
        status,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newService[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const existingService = await db
      .select()
      .from(services)
      .where(and(eq(services.id, parseInt(id)), eq(services.userId, user.id)))
      .limit(1);

    if (existingService.length === 0) {
      return NextResponse.json(
        { error: 'Service not found', code: 'SERVICE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const updates: any = {};

    if (body.serviceName !== undefined) {
      const serviceName = body.serviceName.trim();
      if (!serviceName) {
        return NextResponse.json(
          {
            error: 'Service name cannot be empty',
            code: 'INVALID_SERVICE_NAME',
          },
          { status: 400 }
        );
      }
      updates.serviceName = serviceName;
    }

    if (body.description !== undefined) {
      updates.description = body.description?.trim() || null;
    }

    if (body.price !== undefined) {
      if (typeof body.price !== 'number' || body.price <= 0) {
        return NextResponse.json(
          {
            error: 'Price must be a positive number',
            code: 'INVALID_PRICE',
          },
          { status: 400 }
        );
      }
      updates.price = body.price;
    }

    if (body.status !== undefined) {
      const status = body.status.trim();
      if (status !== 'active' && status !== 'inactive') {
        return NextResponse.json(
          {
            error: 'Status must be either "active" or "inactive"',
            code: 'INVALID_STATUS',
          },
          { status: 400 }
        );
      }
      updates.status = status;
    }

    updates.updatedAt = new Date().toISOString();

    const updatedService = await db
      .update(services)
      .set(updates)
      .where(and(eq(services.id, parseInt(id)), eq(services.userId, user.id)))
      .returning();

    if (updatedService.length === 0) {
      return NextResponse.json(
        { error: 'Service not found', code: 'SERVICE_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedService[0]);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingService = await db
      .select()
      .from(services)
      .where(and(eq(services.id, parseInt(id)), eq(services.userId, user.id)))
      .limit(1);

    if (existingService.length === 0) {
      return NextResponse.json(
        { error: 'Service not found', code: 'SERVICE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deletedService = await db
      .delete(services)
      .where(and(eq(services.id, parseInt(id)), eq(services.userId, user.id)))
      .returning();

    if (deletedService.length === 0) {
      return NextResponse.json(
        { error: 'Service not found', code: 'SERVICE_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Service deleted successfully',
      service: deletedService[0],
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}