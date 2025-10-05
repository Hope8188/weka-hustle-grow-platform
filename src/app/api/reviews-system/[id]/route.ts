import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviewsTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const review = await db.select()
      .from(reviewsTable)
      .where(eq(reviewsTable.id, parseInt(id)))
      .limit(1);

    if (review.length === 0) {
      return NextResponse.json({ 
        error: 'Review not found',
        code: 'REVIEW_NOT_FOUND' 
      }, { status: 404 });
    }

    return NextResponse.json(review[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();

    // Security check: reject if reviewerId or reviewer_id provided in body
    if ('reviewerId' in requestBody || 'reviewer_id' in requestBody) {
      return NextResponse.json({ 
        error: "Reviewer ID cannot be provided in request body",
        code: "REVIEWER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { rating, title, comment } = requestBody;

    // Check if review exists and belongs to user
    const existingReview = await db.select()
      .from(reviewsTable)
      .where(and(
        eq(reviewsTable.id, parseInt(id)),
        eq(reviewsTable.reviewerId, session.user.id)
      ))
      .limit(1);

    if (existingReview.length === 0) {
      const reviewExists = await db.select()
        .from(reviewsTable)
        .where(eq(reviewsTable.id, parseInt(id)))
        .limit(1);

      if (reviewExists.length === 0) {
        return NextResponse.json({ 
          error: 'Review not found',
          code: 'REVIEW_NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json({ 
        error: 'You are not authorized to update this review',
        code: 'NOT_REVIEW_OWNER' 
      }, { status: 403 });
    }

    // Validate rating if provided
    if (rating !== undefined) {
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return NextResponse.json({ 
          error: 'Rating must be an integer between 1 and 5',
          code: 'INVALID_RATING' 
        }, { status: 400 });
      }
    }

    // Validate title if provided
    if (title !== undefined) {
      const trimmedTitle = title.trim();
      if (trimmedTitle.length < 5 || trimmedTitle.length > 100) {
        return NextResponse.json({ 
          error: 'Title must be between 5 and 100 characters',
          code: 'INVALID_TITLE_LENGTH' 
        }, { status: 400 });
      }
    }

    // Validate comment if provided
    if (comment !== undefined) {
      const trimmedComment = comment.trim();
      if (trimmedComment.length < 10) {
        return NextResponse.json({ 
          error: 'Comment must be at least 10 characters',
          code: 'INVALID_COMMENT_LENGTH' 
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (rating !== undefined) {
      updates.rating = rating;
    }

    if (title !== undefined) {
      updates.title = title.trim();
    }

    if (comment !== undefined) {
      updates.comment = comment.trim();
    }

    const updated = await db.update(reviewsTable)
      .set(updates)
      .where(and(
        eq(reviewsTable.id, parseInt(id)),
        eq(reviewsTable.reviewerId, session.user.id)
      ))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update review',
        code: 'UPDATE_FAILED' 
      }, { status: 500 });
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if review exists and belongs to user
    const existingReview = await db.select()
      .from(reviewsTable)
      .where(and(
        eq(reviewsTable.id, parseInt(id)),
        eq(reviewsTable.reviewerId, session.user.id)
      ))
      .limit(1);

    if (existingReview.length === 0) {
      const reviewExists = await db.select()
        .from(reviewsTable)
        .where(eq(reviewsTable.id, parseInt(id)))
        .limit(1);

      if (reviewExists.length === 0) {
        return NextResponse.json({ 
          error: 'Review not found',
          code: 'REVIEW_NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json({ 
        error: 'You are not authorized to delete this review',
        code: 'NOT_REVIEW_OWNER' 
      }, { status: 403 });
    }

    const deleted = await db.delete(reviewsTable)
      .where(and(
        eq(reviewsTable.id, parseInt(id)),
        eq(reviewsTable.reviewerId, session.user.id)
      ))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to delete review',
        code: 'DELETE_FAILED' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Review deleted successfully',
      deletedReview: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}