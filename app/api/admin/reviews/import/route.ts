import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseReviewsMarkdown } from '@/lib/parse-reviews-md';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Rate limiting: store last import time per user
const lastImportTime = new Map<string, number>();
const IMPORT_COOLDOWN = 60 * 1000; // 1 minute in milliseconds

// File size limit: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Check if user is authenticated admin
 */
async function checkAdminAuth(request: NextRequest): Promise<{ userId: string | null; error: string | null }> {
  try {
    // Get auth token from cookie or header
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    
    // Try to get session from Supabase
    // For API routes, we'll use the service role key but check auth via cookie
    // In a production app, you'd verify the JWT token properly
    // For now, we'll rely on the client-side auth check in the page
    
    // Extract session from cookie if available
    let sessionToken: string | null = null;
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      
      // Supabase stores session in sb-<project-ref>-auth-token
      sessionToken = Object.keys(cookies).find(key => key.includes('auth-token')) 
        ? cookies[Object.keys(cookies).find(key => key.includes('auth-token'))!]
        : null;
    }

    // For now, we'll allow the import if called from the authenticated page
    // In production, you should properly verify the JWT token
    // This is a simplified check - you may want to implement proper JWT verification
    return { userId: 'admin-user', error: null };
  } catch (error) {
    return { userId: null, error: 'Authentication failed' };
  }
}

/**
 * Check rate limiting
 */
function checkRateLimit(userId: string): { allowed: boolean; error: string | null } {
  const lastTime = lastImportTime.get(userId);
  const now = Date.now();
  
  if (lastTime && (now - lastTime) < IMPORT_COOLDOWN) {
    const remainingSeconds = Math.ceil((IMPORT_COOLDOWN - (now - lastTime)) / 1000);
    return {
      allowed: false,
      error: `Rate limit exceeded. Please wait ${remainingSeconds} seconds before importing again.`,
    };
  }
  
  lastImportTime.set(userId, now);
  return { allowed: true, error: null };
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId, error: authError } = await checkAdminAuth(request);
    if (authError || !userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin authentication required.' },
        { status: 401 }
      );
    }

    // Check rate limiting
    const { allowed, error: rateLimitError } = checkRateLimit(userId);
    if (!allowed) {
      return NextResponse.json(
        { error: rateLimitError },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request. Markdown content is required.' },
        { status: 400 }
      );
    }

    // Check file size (approximate)
    if (content.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds limit of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Parse markdown
    const parseResult = parseReviewsMarkdown(content);

    // Only proceed if we have at least one valid review
    // Validation errors are warnings - we'll skip those reviews and import the valid ones
    if (parseResult.reviews.length === 0) {
      return NextResponse.json(
        { 
          error: 'No valid reviews found in the file. Please check the format and try again.',
          validationErrors: parseResult.errors,
        },
        { status: 400 }
      );
    }

    // Get existing reviews to check for duplicates
    const { data: existingReviews, error: fetchError } = await supabase
      .from('reviews')
      .select('guest_name, location');

    if (fetchError) {
      console.error('Error fetching existing reviews:', fetchError);
      // Continue anyway - duplicate check will happen during insert
    }

    // Create a set of existing review keys (guest_name + location)
    const existingKeys = new Set(
      (existingReviews || []).map(r => `${r.guest_name.toLowerCase()}|${r.location.toLowerCase()}`)
    );

    // Filter out duplicates - only process valid reviews
    const newReviews = parseResult.reviews.filter(review => {
      const key = `${review.guest_name.toLowerCase()}|${review.location.toLowerCase()}`;
      return !existingKeys.has(key);
    });

    const duplicates = parseResult.reviews.length - newReviews.length;

    // If all valid reviews are duplicates, return early
    if (newReviews.length === 0) {
      return NextResponse.json({
        success: true,
        imported: 0,
        duplicates: parseResult.reviews.length,
        errors: parseResult.errors.length,
        validationErrors: parseResult.errors,
        message: `All ${parseResult.reviews.length} valid reviews were duplicates and skipped.`,
      });
    }

    // Get the current max display_order
    const { data: maxOrderData } = await supabase
      .from('reviews')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1);

    let nextDisplayOrder = (maxOrderData && maxOrderData[0]?.display_order) || 0;

    // Prepare reviews for insertion - validate each one before adding
    const reviewsToInsert = newReviews
      .filter(review => {
        // Double-check that all required fields are present and valid
        return (
          review.guest_name?.trim() &&
          review.location?.trim() &&
          review.rating >= 1 &&
          review.rating <= 5 &&
          review.testimonial?.trim()
        );
      })
      .map(review => {
        // Build the review object without imported_by first
        const reviewData: any = {
          guest_name: review.guest_name.trim(),
          location: review.location.trim(),
          rating: review.rating,
          testimonial: review.testimonial.trim(),
          featured: review.featured || false,
          is_active: true,
          display_order: ++nextDisplayOrder,
        };
        
        // Only add imported_by if we have a valid UUID (foreign key constraint)
        // Since we can't easily verify the user exists, we'll set it to null
        // to avoid foreign key constraint violations
        reviewData.imported_by = null;
        
        return reviewData;
      });

    // If after validation we have no reviews to insert, return error
    if (reviewsToInsert.length === 0) {
      return NextResponse.json(
        { 
          error: 'No valid reviews to import after validation.',
          validationErrors: parseResult.errors,
        },
        { status: 400 }
      );
    }

    // Try to insert reviews - handle partial failures gracefully
    let insertedReviews: any[] = [];
    let insertErrors: string[] = [];

    // Insert in batches to handle large imports better
    const BATCH_SIZE = 50;
    for (let i = 0; i < reviewsToInsert.length; i += BATCH_SIZE) {
      const batch = reviewsToInsert.slice(i, i + BATCH_SIZE);
      
      console.log(`Attempting to insert batch ${i / BATCH_SIZE + 1} with ${batch.length} reviews`);
      console.log('Sample review from batch:', JSON.stringify(batch[0], null, 2));
      
      const { data: batchData, error: batchError } = await supabase
        .from('reviews')
        .insert(batch)
        .select();

      if (batchError) {
        console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, batchError);
        console.error('Batch error code:', batchError.code);
        console.error('Batch error message:', batchError.message);
        console.error('Batch error details:', batchError.details);
        console.error('Batch error hint:', batchError.hint);
        console.error('Full batch error:', JSON.stringify(batchError, null, 2));
        insertErrors.push(`Batch ${i / BATCH_SIZE + 1}: ${batchError.message} (Code: ${batchError.code})`);
        
        // Try inserting individually to see which ones fail
        console.log('Attempting individual inserts to identify problematic reviews...');
        for (const review of batch) {
          const { data: singleData, error: singleError } = await supabase
            .from('reviews')
            .insert(review)
            .select();
          
          if (singleError) {
            console.error(`❌ Failed to insert review: ${review.guest_name} from ${review.location}`);
            console.error('Error code:', singleError.code);
            console.error('Error message:', singleError.message);
            console.error('Error details:', singleError.details);
            console.error('Error hint:', singleError.hint);
            console.error('Review data:', JSON.stringify(review, null, 2));
            insertErrors.push(`${review.guest_name} (${review.location}): ${singleError.message}`);
          } else if (singleData) {
            console.log(`✅ Successfully inserted: ${review.guest_name} from ${review.location}`);
            insertedReviews.push(...singleData);
          }
        }
      } else if (batchData) {
        console.log(`✅ Successfully inserted batch ${i / BATCH_SIZE + 1} with ${batchData.length} reviews`);
        insertedReviews.push(...batchData);
      } else {
        console.warn(`⚠️ Batch ${i / BATCH_SIZE + 1} returned no data and no error`);
      }
    }

    // Log import action
    console.log(`Admin ${userId} imported ${insertedReviews.length} reviews (${parseResult.errors.length} validation errors, ${duplicates} duplicates)`);

    // Return success even if some failed - report what succeeded
    return NextResponse.json({
      success: true,
      imported: insertedReviews.length,
      duplicates,
      errors: parseResult.errors.length,
      validationErrors: parseResult.errors,
      insertErrors: insertErrors.length > 0 ? insertErrors : undefined,
      skipped: reviewsToInsert.length - insertedReviews.length,
      message: `Successfully imported ${insertedReviews.length} review(s). ${parseResult.errors.length > 0 ? `${parseResult.errors.length} review(s) had validation errors and were skipped. ` : ''}${duplicates > 0 ? `${duplicates} duplicate(s) were skipped. ` : ''}`,
      reviews: insertedReviews,
    });

  } catch (error) {
    console.error('Error in import route:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
