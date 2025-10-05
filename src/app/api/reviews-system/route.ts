import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviewsTable, services, user } from '@/db/schema';
import { eq, desc, asc, and, sql, count } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const serviceId = searchParams.get('service_id');

    if (!serviceId || isNaN(parseInt(serviceId))) {
      return NextResponse.json({
        error: 'Valid service_id is required',
        code: 'INVALID_SERVICE_ID'
      }, { status: 400 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortParam = searchParams.get('sort') || 'newest';
    const verifiedOnly = searchParams.get('verified_only') === 'true';

    // Check if service exists
    const serviceExists = await db.select()
      .from(services)
      .where(eq(services.id, parseInt(serviceId)))
      .limit(1);

    if (serviceExists.length === 0) {
      return NextResponse.json({
        error: 'Service not found',
        code: 'SERVICE_NOT_FOUND'
      }, { status: 404 });
    }

    // Build base query with filters
    let whereConditions = [eq(reviewsTable.serviceId, parseInt(serviceId))];
    
    if (verifiedOnly) {
      whereConditions.push(eq(reviewsTable.verifiedPurchase, true));
    }

    // Get total count
    const totalCountResult = await db.select({ count: count() })
      .from(reviewsTable)
      .where(and(...whereConditions));
    
    const totalCount = totalCountResult[0]?.count || 0;

    // Determine sort order
    let orderByClause;
    switch (sortParam) {
      case 'highest_rated':
        orderByClause = [desc(reviewsTable.rating), desc(reviewsTable.createdAt)];
        break;
      case 'lowest_rated':
        orderByClause = [asc(reviewsTable.rating), desc(reviewsTable.createdAt)];
        break;
      case 'most_helpful':
        orderByClause = [desc(reviewsTable.helpfulCount), desc(reviewsTable.createdAt)];
        break;
      case 'newest':
      default:
        orderByClause = [desc(reviewsTable.createdAt)];
        break;
    }

    // Fetch reviews with pagination and sorting
    const reviews = await db.select()
      .from(reviewsTable)
      .where(and(...whereConditions))
      .orderBy(...orderByClause)
      .limit(limit)
      .offset(offset);

    // Calculate average rating for the service
    const ratingStats = await db.select({
      averageRating: sql<number>`CAST(AVG(${reviewsTable.rating}) AS REAL)`,
      totalReviews: count()
    })
      .from(reviewsTable)
      .where(eq(reviewsTable.serviceId, parseInt(serviceId)));

    const averageRating = ratingStats[0]?.averageRating || 0;
    const totalReviews = ratingStats[0]?.totalReviews || 0;

    return NextResponse.json({
      reviews,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      },
      stats: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews
      }
    }, { status: 200 });

  } catch (error) {
    console.error('GET reviews error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      }, { status: 401 });
    }

    const body = await request.json();
    const { service_id, rating, title, comment, verified_purchase } = body;

    // Security check: reject if userId-related fields provided
    if ('userId' in body || 'user_id' in body || 'reviewerId' in body || 'reviewer_id' in body) {
      return NextResponse.json({
        error: 'User ID cannot be provided in request body',
        code: 'USER_ID_NOT_ALLOWED'
      }, { status: 400 });
    }

    // Validate required fields
    if (!service_id || typeof service_id !== 'number') {
      return NextResponse.json({
        error: 'Valid service_id is required',
        code: 'INVALID_SERVICE_ID'
      }, { status: 400 });
    }

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({
        error: 'Rating must be an integer between 1 and 5',
        code: 'INVALID_RATING'
      }, { status: 400 });
    }

    if (!title || typeof title !== 'string' || title.trim().length < 5 || title.trim().length > 100) {
      return NextResponse.json({
        error: 'Title must be between 5 and 100 characters',
        code: 'INVALID_TITLE'
      }, { status: 400 });
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length < 10) {
      return NextResponse.json({
        error: 'Comment must be at least 10 characters',
        code: 'INVALID_COMMENT'
      }, { status: 400 });
    }

    // Check if service exists
    const serviceExists = await db.select()
      .from(services)
      .where(eq(services.id, service_id))
      .limit(1);

    if (serviceExists.length === 0) {
      return NextResponse.json({
        error: 'Service not found',
        code: 'SERVICE_NOT_FOUND'
      }, { status: 404 });
    }

    // Check for duplicate review
    const existingReview = await db.select()
      .from(reviewsTable)
      .where(
        and(
          eq(reviewsTable.serviceId, service_id),
          eq(reviewsTable.reviewerId, session.user.id)
        )
      )
      .limit(1);

    if (existingReview.length > 0) {
      return NextResponse.json({
        error: 'You have already reviewed this service',
        code: 'DUPLICATE_REVIEW'
      }, { status: 400 });
    }

    // Get reviewer name from authenticated user
    const userData = await db.select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    const reviewerName = userData[0]?.name || 'Anonymous';

    // Create the review
    const now = new Date().toISOString();
    const newReview = await db.insert(reviewsTable)
      .values({
        serviceId: service_id,
        reviewerId: session.user.id,
        reviewerName: reviewerName.trim(),
        rating,
        title: title.trim(),
        comment: comment.trim(),
        verifiedPurchase: verified_purchase === true,
        helpfulCount: 0,
        providerResponse: null,
        responseDate: null,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return NextResponse.json(newReview[0], { status: 201 });

  } catch (error) {
    console.error('POST review error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}