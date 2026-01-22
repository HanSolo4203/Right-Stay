export interface ParsedReview {
  guest_name: string;
  location: string;
  rating: number;
  testimonial: string;
  featured: boolean;
}

export interface ValidationError {
  reviewIndex: number;
  field: string;
  message: string;
}

export interface ParseResult {
  reviews: ParsedReview[];
  errors: ValidationError[];
}

/**
 * Parses markdown file content into review objects
 * Expected format:
 * 
 * ## Review N
 * **Guest Name:** [name]
 * **Location:** [location]
 * **Rating:** [1-5]/5
 * **Testimonial:** [review text]
 * **Featured:** [true/false] (optional)
 */
export function parseReviewsMarkdown(content: string): ParseResult {
  const reviews: ParsedReview[] = [];
  const errors: ValidationError[] = [];

  // Split content by review sections (## Review)
  const reviewSections = content.split(/^##\s+Review\s+\d+/im);
  
  // Remove the first element if it's just the header/template info
  const sections = reviewSections.slice(1);

  sections.forEach((section, index) => {
    const reviewIndex = index + 1;
    const review: Partial<ParsedReview> = {
      featured: false, // Default to false
    };

    // Extract Guest Name
    const guestNameMatch = section.match(/\*\*Guest Name:\*\*\s*(.+)/i);
    if (guestNameMatch) {
      review.guest_name = guestNameMatch[1].trim();
    } else {
      errors.push({
        reviewIndex,
        field: 'guest_name',
        message: 'Missing required field: Guest Name',
      });
    }

    // Extract Location
    const locationMatch = section.match(/\*\*Location:\*\*\s*(.+)/i);
    if (locationMatch) {
      review.location = locationMatch[1].trim();
    } else {
      errors.push({
        reviewIndex,
        field: 'location',
        message: 'Missing required field: Location',
      });
    }

    // Extract Rating
    const ratingMatch = section.match(/\*\*Rating:\*\*\s*(\d+)\/5/i);
    if (ratingMatch) {
      const rating = parseInt(ratingMatch[1], 10);
      if (rating >= 1 && rating <= 5) {
        review.rating = rating;
      } else {
        errors.push({
          reviewIndex,
          field: 'rating',
          message: `Invalid rating: ${rating}. Must be between 1 and 5`,
        });
      }
    } else {
      errors.push({
        reviewIndex,
        field: 'rating',
        message: 'Missing or invalid required field: Rating (format: X/5)',
      });
    }

    // Extract Testimonial
    const testimonialMatch = section.match(/\*\*Testimonial:\*\*\s*([\s\S]+?)(?=\*\*|$)/i);
    if (testimonialMatch) {
      review.testimonial = testimonialMatch[1].trim();
    } else {
      errors.push({
        reviewIndex,
        field: 'testimonial',
        message: 'Missing required field: Testimonial',
      });
    }

    // Extract Featured (optional)
    const featuredMatch = section.match(/\*\*Featured:\*\*\s*(true|false)/i);
    if (featuredMatch) {
      review.featured = featuredMatch[1].toLowerCase() === 'true';
    }

    // Only add review if it has all required fields
    if (review.guest_name && review.location && review.rating && review.testimonial) {
      reviews.push(review as ParsedReview);
    }
  });

  return { reviews, errors };
}

/**
 * Generates a sample markdown template
 */
export function generateSampleTemplate(): string {
  return `# Right Stay Africa Reviews Import Template

## Review 1
**Guest Name:** John Smith
**Location:** New York, USA
**Rating:** 5/5
**Testimonial:** Amazing stay! The apartment was clean and the host was responsive.
**Featured:** true

## Review 2
**Guest Name:** Jane Doe
**Location:** London, UK
**Rating:** 5/5
**Testimonial:** Great location and beautiful views.
**Featured:** false

## Review 3
**Guest Name:** Sarah Johnson
**Location:** Cape Town, South Africa
**Rating:** 5/5
**Testimonial:** Our stay with Right Stay Africa was absolutely perfect. The property exceeded our expectations, and the team was incredibly responsive. We can't wait to return!
**Featured:** true
`;
}
