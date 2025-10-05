import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviewsTable, services } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED' 
      }, { status: 401 });
    }

    const userId = session.user.id;

    // Get review ID from URL
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');

    // Validate review ID
    if (!reviewId || isNaN(parseInt(reviewId))) {
      return NextResponse.json({ 
        error: 'Valid review ID is required',
        code: 'INVALID_REVIEW_ID' 
      }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const { response } = body;

    // Validate response field
    if (!response) {
      return NextResponse.json({ 
        error: 'Response is required',
        code: 'MISSING_RESPONSE' 
      }, { status: 400 });
    }

    // Validate response length
    const trimmedResponse = response.trim();
    if (trimmedResponse.length < 10) {
      return NextResponse.json({ 
        error: 'Response must be at least 10 characters',
        code: 'RESPONSE_TOO_SHORT' 
      }, { status: 400 });
    }

    if (trimmedResponse.length > 500) {
      return NextResponse.json({ 
        error: 'Response must not exceed 500 characters',
        code: 'RESPONSE_TOO_LONG' 
      }, { status: 400 });
    }

    // Fetch review by ID
    const review = await db.select()
      .from(reviewsTable)
      .where(eq(reviewsTable.id, parseInt(reviewId)))
      .limit(1);

    if (review.length === 0) {
      return NextResponse.json({ 
        error: 'Review not found',
        code: 'REVIEW_NOT_FOUND' 
      }, { status: 404 });
    }

    const reviewData = review[0];

    // Check if review already has a provider response
    if (reviewData.providerResponse) {
      return NextResponse.json({ 
        error: 'Review already has a provider response',
        code: 'RESPONSE_ALREADY_EXISTS' 
      }, { status: 400 });
    }

    // Fetch service associated with the review
    const service = await db.select()
      .from(services)
      .where(eq(services.id, reviewData.serviceId))
      .limit(1);

    if (service.length === 0) {
      return NextResponse.json({ 
        error: 'Service not found',
        code: 'SERVICE_NOT_FOUND' 
      }, { status: 404 });
    }

    const serviceData = service[0];

    // Verify user is the service owner
    if (serviceData.userId !== userId) {
      return NextResponse.json({ 
        error: 'Only the service owner can respond to reviews',
        code: 'NOT_SERVICE_OWNER' 
      }, { status: 403 });
    }

    // Prevent service owner from responding to their own review
    if (reviewData.reviewerId === userId) {
      return NextResponse.json({ 
        error: 'Cannot respond to your own review',
        code: 'CANNOT_RESPOND_TO_OWN_REVIEW' 
      }, { status: 400 });
    }

    // Update review with provider response
    const updated = await db.update(reviewsTable)
      .set({
        providerResponse: trimmedResponse,
        responseDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .where(eq(reviewsTable.id, parseInt(reviewId)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update review',
        code: 'UPDATE_FAILED' 
      }, { status: 500 });
    }

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}