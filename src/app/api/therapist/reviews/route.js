import { NextResponse } from "next/server";
import {
  getSourceByTherapistId,
  getReviewsByTherapistId,
  canRefresh,
} from "@/repositories/googleReviews";
import { getTherapistId } from "@/lib/auth";

/**
 * GET /api/therapist/reviews
 *
 * Returns the therapist's review source config + cached reviews for the dashboard.
 */
export async function GET(request) {
  try {
    const therapistId = await getTherapistId(request);
    if (!therapistId) {
      return NextResponse.json(
        { error: "Non authentifié." },
        { status: 401 }
      );
    }

    const source = await getSourceByTherapistId(therapistId);
    const reviews = await getReviewsByTherapistId(therapistId);
    const refreshAllowed = await canRefresh(therapistId);

    return NextResponse.json({
      source: source
        ? {
            googleMapsUrl: source.google_maps_url,
            status: source.status,
            lastScrapedAt: source.last_scraped_at,
            nextRefreshAvailableAt: source.next_refresh_available_at,
            canRefresh: refreshAllowed,
            totalReviewsFound: source.total_reviews_found,
            googleTotalReviews: source.google_total_reviews || null,
            googleRating: source.google_rating || null,
            errorMessage: source.error_message,
          }
        : null,
      reviews: reviews.map((r) => ({
        reviewerName: r.reviewer_name,
        reviewText: r.review_text,
        rating: r.rating,
        publishedAt: r.published_at,
        reviewerPhotoUrl: r.reviewer_photo_url,
        reviewUrl: r.google_review_url,
      })),
    });
  } catch (err) {
    console.error("[GET /api/therapist/reviews]", err);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
