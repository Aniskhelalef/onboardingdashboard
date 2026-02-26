import { NextResponse } from "next/server";
import { extractPlaceIdFromUrl } from "@/services/googleReviews";
import { createSource } from "@/repositories/googleReviews";
import { runScrapeJob } from "@/jobs/scrapeReviews";
import { getTherapistId } from "@/lib/auth";

/**
 * POST /api/therapist/reviews/connect
 *
 * Body: { googleMapsUrl: string }
 * Creates a review source and triggers the first scrape (async).
 */
export async function POST(request) {
  try {
    const therapistId = await getTherapistId(request);
    if (!therapistId) {
      return NextResponse.json(
        { error: "Non authentifié." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { googleMapsUrl, placeId: providedPlaceId, placeName } = body;

    if (!googleMapsUrl || typeof googleMapsUrl !== "string") {
      return NextResponse.json(
        { error: "Le champ googleMapsUrl est requis." },
        { status: 400 }
      );
    }

    // Validate the URL
    let urlData;
    try {
      urlData = extractPlaceIdFromUrl(googleMapsUrl);
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    // Use provided placeId if extraction didn't find one
    const finalPlaceId = urlData.placeId || providedPlaceId || null;

    // Create or update the source record
    const source = await createSource(
      therapistId,
      urlData.url,
      finalPlaceId,
      placeName || null
    );

    // Fire-and-forget: trigger scrape in background
    runScrapeJob(source.id).catch((err) => {
      console.error("[connect] Background scrape failed:", err);
    });

    return NextResponse.json({
      success: true,
      message:
        "Vos avis sont en cours d'importation. Cela peut prendre jusqu'à 60 secondes.",
      sourceId: source.id,
    });
  } catch (err) {
    console.error("[POST /api/therapist/reviews/connect]", err);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
