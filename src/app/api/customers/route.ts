import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { customers } from '@/db/schema';
import { eq, and, like, or } from 'drizzle-orm';
import { auth } from '@/lib/auth';

async function getAuthenticatedUser(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  
  if (!session || !session.user) {
    return null;
  }
  
  return session.user;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Single customer by ID
    if (id) {
      const customerId = parseInt(id);
      if (isNaN(customerId)) {
        return NextResponse.json({ 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        }, { status: 400 });
      }

      const customer = await db.select()
        .from(customers)
        .where(and(
          eq(customers.id, customerId),
          eq(customers.userId, user.id)
        ))
        .limit(1);

      if (customer.length === 0) {
        return NextResponse.json({ 
          error: 'Customer not found',
          code: 'CUSTOMER_NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(customer[0], { status: 200 });
    }

    // List customers with optional search
    let query = db.select().from(customers).where(eq(customers.userId, user.id));

    if (search) {
      const searchTerm = `%${search}%`;
      query = db.select()
        .from(customers)
        .where(and(
          eq(customers.userId, user.id),
          or(
            like(customers.name, searchTerm),
            like(customers.email, searchTerm),
            like(customers.phone, searchTerm)
          )
        ));
    }

    const results = await query.limit(limit).offset(offset);
    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: 'User ID cannot be provided in request body',
        code: 'USER_ID_NOT_ALLOWED' 
      }, { status: 400 });
    }

    // Extract and sanitize inputs
    const name = body.name?.trim();
    const email = body.email?.trim() || null;
    const phone = body.phone?.trim() || null;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ 
        error: 'Name is required',
        code: 'MISSING_NAME' 
      }, { status: 400 });
    }

    // Create customer
    const timestamp = new Date().toISOString();
    const newCustomer = await db.insert(customers)
      .values({
        userId: user.id,
        name,
        email,
        phone,
        createdAt: timestamp,
        updatedAt: timestamp
      })
      .returning();

    return NextResponse.json(newCustomer[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const customerId = parseInt(id);
    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: 'User ID cannot be provided in request body',
        code: 'USER_ID_NOT_ALLOWED' 
      }, { status: 400 });
    }

    // Check if customer exists and belongs to user
    const existingCustomer = await db.select()
      .from(customers)
      .where(and(
        eq(customers.id, customerId),
        eq(customers.userId, user.id)
      ))
      .limit(1);

    if (existingCustomer.length === 0) {
      return NextResponse.json({ 
        error: 'Customer not found',
        code: 'CUSTOMER_NOT_FOUND' 
      }, { status: 404 });
    }

    // Prepare update object
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if ('name' in body) {
      const name = body.name?.trim();
      if (!name) {
        return NextResponse.json({ 
          error: 'Name cannot be empty',
          code: 'INVALID_NAME' 
        }, { status: 400 });
      }
      updates.name = name;
    }

    if ('email' in body) {
      updates.email = body.email?.trim() || null;
    }

    if ('phone' in body) {
      updates.phone = body.phone?.trim() || null;
    }

    // Update customer
    const updatedCustomer = await db.update(customers)
      .set(updates)
      .where(and(
        eq(customers.id, customerId),
        eq(customers.userId, user.id)
      ))
      .returning();

    return NextResponse.json(updatedCustomer[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const customerId = parseInt(id);

    // Check if customer exists and belongs to user
    const existingCustomer = await db.select()
      .from(customers)
      .where(and(
        eq(customers.id, customerId),
        eq(customers.userId, user.id)
      ))
      .limit(1);

    if (existingCustomer.length === 0) {
      return NextResponse.json({ 
        error: 'Customer not found',
        code: 'CUSTOMER_NOT_FOUND' 
      }, { status: 404 });
    }

    // Delete customer
    const deleted = await db.delete(customers)
      .where(and(
        eq(customers.id, customerId),
        eq(customers.userId, user.id)
      ))
      .returning();

    return NextResponse.json({
      message: 'Customer deleted successfully',
      customer: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}