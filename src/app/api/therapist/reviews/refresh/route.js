import { NextResponse } from "next/server";
import {
  getSourceByTherapistId,
  canRefresh,
} from "@/repositories/googleReviews";
import { runScrapeJob } from "@/jobs/scrapeReviews";
import { getTherapistId } from "@/lib/auth";

// Simple in-memory rate limiter: max 1 refresh request per therapist per 60s
const recentRequests = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;

function isRateLimited(therapistId) {
  const now = Date.now();
  const last = recentRequests.get(therapistId);
  if (last && now - last < RATE_LIMIT_WINDOW_MS) return true;
  recentRequests.set(therapistId, now);
  // Cleanup old entries periodically
  if (recentRequests.size > 1000) {
    for (const [id, ts] of recentRequests) {
      if (now - ts > RATE_LIMIT_WINDOW_MS) recentRequests.delete(id);
    }
  }
  return false;
}

/**
 * POST /api/therapist/reviews/refresh
 *
 * Triggers a review re-scrape if the 15-day cooldown has elapsed.
 * Rate limited to 1 request per minute per therapist.
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

    // Abuse prevention: 1 request per 60s
    if (isRateLimited(therapistId)) {
      return NextResponse.json(
        { error: "Trop de requêtes. Réessayez dans une minute." },
        { status: 429 }
      );
    }

    const source = await getSourceByTherapistId(therapistId);
    if (!source) {
      return NextResponse.json(
        {
          error:
            "Aucune source Google configurée. Connectez d'abord votre fiche Google.",
        },
        { status: 404 }
      );
    }

    const refreshAllowed = await canRefresh(therapistId);
    if (!refreshAllowed) {
      return NextResponse.json(
        {
          error: `Rafraîchissement disponible le ${new Date(source.next_refresh_available_at).toLocaleDateString("fr-FR")}`,
          nextRefreshAt: source.next_refresh_available_at,
        },
        { status: 429 }
      );
    }

    // Fire-and-forget: trigger scrape in background
    runScrapeJob(source.id).catch((err) => {
      console.error("[refresh] Background scrape failed:", err);
    });

    return NextResponse.json({
      success: true,
      message: "Vos avis sont en cours de rafraîchissement.",
    });
  } catch (err) {
    console.error("[POST /api/therapist/reviews/refresh]", err);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
