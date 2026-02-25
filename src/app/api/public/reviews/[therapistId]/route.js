import { NextResponse } from "next/server";
import { getReviewsByTherapistId } from "@/repositories/googleReviews";

/**
 * GET /api/public/reviews/:therapistId
 *
 * Public endpoint — called by the review widget on the therapist's website.
 * No auth required. Cached for 1 hour.
 */
export async function GET(_request, { params }) {
  try {
    const { therapistId } = params;

    if (!therapistId) {
      return NextResponse.json(
        { error: "therapistId requis." },
        { status: 400 }
      );
    }

    const reviews = await getReviewsByTherapistId(therapistId);

    return NextResponse.json(
      {
        reviews: reviews.map((r) => ({
          reviewerName: r.reviewer_name,
          reviewText: r.review_text,
          rating: r.rating,
          publishedAt: r.published_at,
          reviewerPhotoUrl: r.reviewer_photo_url,
        })),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
        },
      }
    );
  } catch (err) {
    console.error("[GET /api/public/reviews]", err);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
