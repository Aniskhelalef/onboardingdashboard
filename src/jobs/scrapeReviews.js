/**
 * Background scraping job for Google Reviews.
 *
 * Fire-and-forget: call runScrapeJob(sourceId) without awaiting.
 * It updates the source status in DB throughout the process.
 */

import { scrapeGoogleReviews, searchGooglePlace } from "@/services/googleReviews";
import {
  updateSourceStatus,
  markScraped,
  saveReviews,
  updateSourceImage,
} from "@/repositories/googleReviews";
import { supabase } from "@/lib/supabase";

/**
 * Runs the full scrape pipeline for a given source.
 *
 * 1. Sets status to 'scraping'
 * 2. Fetches the Google Maps URL from the source record
 * 3. Calls Apify to scrape reviews
 * 4. Saves filtered reviews to DB
 * 5. Marks source as 'completed' or 'failed'
 *
 * @param {string} sourceId - UUID of the google_review_sources record
 */
export async function runScrapeJob(sourceId) {
  const log = (msg, data) =>
    console.log(`[scrapeReviews][${sourceId}] ${msg}`, data ?? "");

  try {
    log("Scrape started");
    await updateSourceStatus(sourceId, "scraping");

    // Fetch the source to get the Google Maps URL and place ID
    const { data: source, error } = await supabase
      .from("google_review_sources")
      .select("google_maps_url, google_place_id, therapist_id")
      .eq("id", sourceId)
      .single();

    if (error || !source) {
      throw new Error("Source introuvable.");
    }

    log(`Scraping URL: ${source.google_maps_url}${source.google_place_id ? ` (placeId: ${source.google_place_id})` : ""}`);

    // Scrape reviews via Apify
    const { reviews, totalFiveStar, googleTotal, googleRating, runId } = await scrapeGoogleReviews(
      source.google_maps_url,
      source.google_place_id
    );

    log(
      `Apify run ${runId}: found ${totalFiveStar} five-star reviews with text, storing ${reviews.length} (Google total: ${googleTotal}, rating: ${googleRating})`
    );

    // Save reviews (full replace)
    await saveReviews(sourceId, reviews);

    // Mark as completed — pass info message if no matching reviews found
    const infoMsg = reviews.length === 0
      ? "Aucun avis 5 étoiles avec texte trouvé. Encouragez vos patients à laisser des avis détaillés !"
      : null;
    await markScraped(sourceId, totalFiveStar, infoMsg, googleTotal, googleRating);
    log(`Scrape completed: stored ${reviews.length} reviews`);

    // Fetch cover image via Apify places search (fire-and-forget)
    if (source.place_name || source.google_place_id) {
      try {
        const query = source.place_name || source.google_place_id;
        const place = await searchGooglePlace(query);
        if (place?.imageUrl) {
          await updateSourceImage(sourceId, place.imageUrl);
          log(`Cover image saved: ${place.imageUrl}`);
        }
      } catch (imgErr) {
        log("Image fetch failed (non-blocking):", imgErr.message);
      }
    }
  } catch (err) {
    log("Scrape FAILED:", err.message);

    try {
      await updateSourceStatus(
        sourceId,
        "failed",
        err.message || "Erreur inconnue lors du scraping."
      );
    } catch (statusErr) {
      log("Failed to update status:", statusErr.message);
    }
  }
}
