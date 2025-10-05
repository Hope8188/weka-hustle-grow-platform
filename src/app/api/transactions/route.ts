import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { transactions, customers } from '@/db/schema';
import { eq, and, like, or, desc } from 'drizzle-orm';
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

    if (id) {
      const transactionId = parseInt(id);
      if (isNaN(transactionId)) {
        return NextResponse.json({ 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        }, { status: 400 });
      }

      const result = await db.select()
        .from(transactions)
        .where(and(
          eq(transactions.id, transactionId),
          eq(transactions.userId, user.id)
        ))
        .limit(1);

      if (result.length === 0) {
        return NextResponse.json({ 
          error: 'Transaction not found',
          code: 'NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(result[0]);
    }

    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const customerId = searchParams.get('customerId');

    let conditions = [eq(transactions.userId, user.id)];

    if (search) {
      const searchCondition = or(
        like(transactions.mpesaCode, `%${search}%`),
        like(transactions.description, `%${search}%`)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    if (type) {
      const trimmedType = type.trim();
      if (trimmedType !== 'payment' && trimmedType !== 'expense') {
        return NextResponse.json({ 
          error: 'Transaction type must be either "payment" or "expense"',
          code: 'INVALID_TYPE' 
        }, { status: 400 });
      }
      conditions.push(eq(transactions.transactionType, trimmedType));
    }

    if (customerId) {
      const customerIdInt = parseInt(customerId);
      if (isNaN(customerIdInt)) {
        return NextResponse.json({ 
          error: 'Valid customer ID is required',
          code: 'INVALID_CUSTOMER_ID' 
        }, { status: 400 });
      }
      conditions.push(eq(transactions.customerId, customerIdInt));
    }

    const results = await db.select()
      .from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.transactionDate))
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
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: 'User ID cannot be provided in request body',
        code: 'USER_ID_NOT_ALLOWED' 
      }, { status: 400 });
    }

    const { amount, transactionType, transactionDate, customerId, mpesaCode, description } = body;

    if (!amount) {
      return NextResponse.json({ 
        error: 'Amount is required',
        code: 'MISSING_AMOUNT' 
      }, { status: 400 });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ 
        error: 'Amount must be a positive number',
        code: 'INVALID_AMOUNT' 
      }, { status: 400 });
    }

    if (!transactionType) {
      return NextResponse.json({ 
        error: 'Transaction type is required',
        code: 'MISSING_TRANSACTION_TYPE' 
      }, { status: 400 });
    }

    const trimmedType = transactionType.trim();
    if (trimmedType !== 'payment' && trimmedType !== 'expense') {
      return NextResponse.json({ 
        error: 'Transaction type must be either "payment" or "expense"',
        code: 'INVALID_TRANSACTION_TYPE' 
      }, { status: 400 });
    }

    if (!transactionDate) {
      return NextResponse.json({ 
        error: 'Transaction date is required',
        code: 'MISSING_TRANSACTION_DATE' 
      }, { status: 400 });
    }

    const dateObj = new Date(transactionDate);
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json({ 
        error: 'Transaction date must be a valid ISO date string',
        code: 'INVALID_TRANSACTION_DATE' 
      }, { status: 400 });
    }

    if (customerId !== undefined && customerId !== null) {
      const customerIdInt = parseInt(customerId);
      if (isNaN(customerIdInt)) {
        return NextResponse.json({ 
          error: 'Customer ID must be a valid integer',
          code: 'INVALID_CUSTOMER_ID' 
        }, { status: 400 });
      }

      const customerExists = await db.select()
        .from(customers)
        .where(and(
          eq(customers.id, customerIdInt),
          eq(customers.userId, user.id)
        ))
        .limit(1);

      if (customerExists.length === 0) {
        return NextResponse.json({ 
          error: 'Customer not found or does not belong to user',
          code: 'INVALID_CUSTOMER' 
        }, { status: 400 });
      }
    }

    const newTransaction = await db.insert(transactions)
      .values({
        userId: user.id,
        amount: numAmount,
        transactionType: trimmedType,
        transactionDate: transactionDate,
        customerId: customerId !== undefined && customerId !== null ? parseInt(customerId) : null,
        mpesaCode: mpesaCode ? mpesaCode.trim() : null,
        description: description ? description.trim() : null,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newTransaction[0], { status: 201 });

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

    const transactionId = parseInt(id);

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: 'User ID cannot be provided in request body',
        code: 'USER_ID_NOT_ALLOWED' 
      }, { status: 400 });
    }

    const existing = await db.select()
      .from(transactions)
      .where(and(
        eq(transactions.id, transactionId),
        eq(transactions.userId, user.id)
      ))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Transaction not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const { amount, transactionType, transactionDate, customerId, mpesaCode, description } = body;

    const updates: any = {};

    if (amount !== undefined) {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return NextResponse.json({ 
          error: 'Amount must be a positive number',
          code: 'INVALID_AMOUNT' 
        }, { status: 400 });
      }
      updates.amount = numAmount;
    }

    if (transactionType !== undefined) {
      const trimmedType = transactionType.trim();
      if (trimmedType !== 'payment' && trimmedType !== 'expense') {
        return NextResponse.json({ 
          error: 'Transaction type must be either "payment" or "expense"',
          code: 'INVALID_TRANSACTION_TYPE' 
        }, { status: 400 });
      }
      updates.transactionType = trimmedType;
    }

    if (transactionDate !== undefined) {
      const dateObj = new Date(transactionDate);
      if (isNaN(dateObj.getTime())) {
        return NextResponse.json({ 
          error: 'Transaction date must be a valid ISO date string',
          code: 'INVALID_TRANSACTION_DATE' 
        }, { status: 400 });
      }
      updates.transactionDate = transactionDate;
    }

    if (customerId !== undefined) {
      if (customerId === null) {
        updates.customerId = null;
      } else {
        const customerIdInt = parseInt(customerId);
        if (isNaN(customerIdInt)) {
          return NextResponse.json({ 
            error: 'Customer ID must be a valid integer',
            code: 'INVALID_CUSTOMER_ID' 
          }, { status: 400 });
        }

        const customerExists = await db.select()
          .from(customers)
          .where(and(
            eq(customers.id, customerIdInt),
            eq(customers.userId, user.id)
          ))
          .limit(1);

        if (customerExists.length === 0) {
          return NextResponse.json({ 
            error: 'Customer not found or does not belong to user',
            code: 'INVALID_CUSTOMER' 
          }, { status: 400 });
        }

        updates.customerId = customerIdInt;
      }
    }

    if (mpesaCode !== undefined) {
      updates.mpesaCode = mpesaCode ? mpesaCode.trim() : null;
    }

    if (description !== undefined) {
      updates.description = description ? description.trim() : null;
    }

    const updated = await db.update(transactions)
      .set(updates)
      .where(and(
        eq(transactions.id, transactionId),
        eq(transactions.userId, user.id)
      ))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Transaction not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
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

    const transactionId = parseInt(id);

    const existing = await db.select()
      .from(transactions)
      .where(and(
        eq(transactions.id, transactionId),
        eq(transactions.userId, user.id)
      ))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Transaction not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(transactions)
      .where(and(
        eq(transactions.id, transactionId),
        eq(transactions.userId, user.id)
      ))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: 'Transaction not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Transaction deleted successfully',
      transaction: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}