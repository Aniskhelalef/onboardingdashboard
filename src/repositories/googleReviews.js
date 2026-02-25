/**
 * Data access layer for Google Reviews.
 *
 * All functions interact with Supabase tables:
 *   - google_review_sources (one per therapist)
 *   - google_reviews (max 15 per source)
 */

import { supabase } from "@/lib/supabase";

const REFRESH_COOLDOWN_DAYS = 15;

// ─── Source CRUD ─────────────────────────────────────────────

/**
 * Creates a new review source for a therapist.
 * If one already exists, returns the existing record.
 */
export async function createSource(therapistId, googleMapsUrl, googlePlaceId = null) {
  // Check if source already exists
  const existing = await getSourceByTherapistId(therapistId);
  if (existing) {
    // Update the URL / place ID if changed
    const { data, error } = await supabase
      .from("google_review_sources")
      .update({
        google_maps_url: googleMapsUrl,
        google_place_id: googlePlaceId,
        status: "pending",
        error_message: null,
      })
      .eq("therapist_id", therapistId)
      .select()
      .single();

    if (error) throw new Error(`Erreur mise à jour source : ${error.message}`);
    return data;
  }

  const { data, error } = await supabase
    .from("google_review_sources")
    .insert({
      therapist_id: therapistId,
      google_maps_url: googleMapsUrl,
      google_place_id: googlePlaceId,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw new Error(`Erreur création source : ${error.message}`);
  return data;
}

/**
 * Returns the review source config for a therapist, or null.
 */
export async function getSourceByTherapistId(therapistId) {
  const { data, error } = await supabase
    .from("google_review_sources")
    .select("*")
    .eq("therapist_id", therapistId)
    .maybeSingle();

  if (error) throw new Error(`Erreur lecture source : ${error.message}`);
  return data;
}

/**
 * Updates the scraping status (and optional error message) on a source.
 */
export async function updateSourceStatus(sourceId, status, errorMessage = null) {
  const update = { status };
  if (errorMessage !== null) {
    update.error_message = errorMessage;
  } else if (status !== "failed" && status !== "completed") {
    // Clear error when starting a new scrape, but keep it on failed/completed
    update.error_message = null;
  }

  const { data, error } = await supabase
    .from("google_review_sources")
    .update(update)
    .eq("id", sourceId)
    .select()
    .single();

  if (error) throw new Error(`Erreur mise à jour statut : ${error.message}`);
  return data;
}

/**
 * Marks a source as successfully scraped.
 * Sets last_scraped_at to now and computes next_refresh_available_at.
 */
export async function markScraped(sourceId, totalFound, infoMessage = null, googleTotal = null, googleRating = null) {
  const now = new Date();
  const nextRefresh = new Date(now);
  nextRefresh.setDate(nextRefresh.getDate() + REFRESH_COOLDOWN_DAYS);

  const update = {
    status: "completed",
    last_scraped_at: now.toISOString(),
    next_refresh_available_at: nextRefresh.toISOString(),
    total_reviews_found: totalFound,
  };

  if (googleTotal != null) update.google_total_reviews = googleTotal;
  if (googleRating != null) update.google_rating = googleRating;

  // Only clear error_message if no info message is provided
  update.error_message = infoMessage ?? null;

  const { data, error } = await supabase
    .from("google_review_sources")
    .update(update)
    .eq("id", sourceId)
    .select()
    .single();

  if (error) throw new Error(`Erreur markScraped : ${error.message}`);
  return data;
}

// ─── Reviews CRUD ────────────────────────────────────────────

/**
 * Replaces all reviews for a source (full replace strategy).
 * Deletes existing reviews then inserts the new batch.
 */
export async function saveReviews(sourceId, reviews) {
  // Delete existing reviews for this source
  const { error: deleteError } = await supabase
    .from("google_reviews")
    .delete()
    .eq("source_id", sourceId);

  if (deleteError) throw new Error(`Erreur suppression avis : ${deleteError.message}`);

  // Nothing to insert
  if (!reviews || reviews.length === 0) return [];

  const rows = reviews.map((r) => ({
    source_id: sourceId,
    reviewer_name: r.reviewerName,
    review_text: r.reviewText,
    rating: r.rating,
    published_at: r.publishedAt,
    reviewer_photo_url: r.reviewerPhotoUrl,
    google_review_url: r.reviewUrl,
  }));

  const { data, error } = await supabase
    .from("google_reviews")
    .insert(rows)
    .select();

  if (error) throw new Error(`Erreur insertion avis : ${error.message}`);
  return data;
}

/**
 * Returns cached reviews for a therapist (for display on their website).
 * Joins through google_review_sources to find by therapist_id.
 */
export async function getReviewsByTherapistId(therapistId) {
  // First get the source
  const source = await getSourceByTherapistId(therapistId);
  if (!source) return [];

  const { data, error } = await supabase
    .from("google_reviews")
    .select("*")
    .eq("source_id", source.id)
    .order("published_at", { ascending: false });

  if (error) throw new Error(`Erreur lecture avis : ${error.message}`);
  return data || [];
}

// ─── Refresh Cooldown ────────────────────────────────────────

/**
 * Returns true if the therapist can refresh their reviews.
 * Allowed if: no source exists, never scraped, or cooldown has elapsed.
 */
export async function canRefresh(therapistId) {
  const source = await getSourceByTherapistId(therapistId);

  // No source yet — they can set one up
  if (!source) return true;

  // Never scraped
  if (!source.last_scraped_at) return true;

  // Currently scraping
  if (source.status === "scraping") return false;

  // Check cooldown
  const nextRefresh = source.next_refresh_available_at
    ? new Date(source.next_refresh_available_at)
    : new Date(source.last_scraped_at);

  if (!source.next_refresh_available_at) {
    nextRefresh.setDate(nextRefresh.getDate() + REFRESH_COOLDOWN_DAYS);
  }

  return new Date() >= nextRefresh;
}
