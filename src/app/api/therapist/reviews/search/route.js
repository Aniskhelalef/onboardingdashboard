import { NextResponse } from "next/server";
import { searchGooglePlace } from "@/services/googleReviews";
import { getTherapistId } from "@/lib/auth";

/**
 * POST /api/therapist/reviews/search
 *
 * Body: { query: string }
 * Searches Google Maps for a business and returns the top match.
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
    const { query } = body;

    if (!query || typeof query !== "string" || query.trim().length < 3) {
      return NextResponse.json(
        { error: "Veuillez saisir le nom de votre cabinet et votre ville." },
        { status: 400 }
      );
    }

    const place = await searchGooglePlace(query);

    if (!place) {
      return NextResponse.json({
        place: null,
        message: "Aucun établissement trouvé. Vérifiez le nom et réessayez.",
      });
    }

    return NextResponse.json({ place });
  } catch (err) {
    console.error("[POST /api/therapist/reviews/search]", err);
    return NextResponse.json(
      { error: err.message || "Erreur serveur." },
      { status: 500 }
    );
  }
}
