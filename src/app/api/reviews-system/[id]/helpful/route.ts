import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviewsTable, reviewHelpful } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get review ID from URL search params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid review ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const reviewId = parseInt(id);

    // Check if review exists
    const existingReview = await db.select()
      .from(reviewsTable)
      .where(eq(reviewsTable.id, reviewId))
      .limit(1);

    if (existingReview.length === 0) {
      return NextResponse.json({ 
        error: 'Review not found',
        code: 'REVIEW_NOT_FOUND' 
      }, { status: 404 });
    }

    // Check if user has already marked this review as helpful
    const existingHelpful = await db.select()
      .from(reviewHelpful)
      .where(
        and(
          eq(reviewHelpful.reviewId, reviewId),
          eq(reviewHelpful.userId, userId)
        )
      )
      .limit(1);

    if (existingHelpful.length > 0) {
      return NextResponse.json({ 
        error: 'You have already marked this review as helpful',
        code: 'ALREADY_MARKED_HELPFUL' 
      }, { status: 400 });
    }

    // Insert into review_helpful table
    await db.insert(reviewHelpful)
      .values({
        reviewId,
        userId,
        createdAt: new Date().toISOString()
      });

    // Increment helpfulCount in reviews_table
    const updatedReview = await db.update(reviewsTable)
      .set({
        helpfulCount: existingReview[0].helpfulCount + 1,
        updatedAt: new Date().toISOString()
      })
      .where(eq(reviewsTable.id, reviewId))
      .returning();

    return NextResponse.json(updatedReview[0], { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}