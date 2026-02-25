/**
 * Google Reviews Scraper Service
 *
 * Uses Apify's compass/google-maps-reviews-scraper to fetch reviews
 * for a therapist's Google Business profile.
 *
 * Cost-optimised: caps at 20 reviews per run (~$0.01 per scrape) using
 * placeIds for fast resolution. Our local filter keeps only 5-star reviews
 * with non-empty text, capped at 15.
 *
 * Environment variable required: APIFY_API_TOKEN
 */

import { ApifyClient } from "apify-client";

const APIFY_REVIEWS_ACTOR = "compass/google-maps-reviews-scraper";
const APIFY_PLACES_ACTOR = "compass/crawler-google-places";
const MAX_REVIEWS = 15;
const APIFY_MAX_PER_PLACE = 20; // buffer of 5 for empty-text filtering

/**
 * Strips HTML tags and script content from a string, returning plain text.
 */
export function sanitizeText(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

/**
 * Validates and extracts information from a Google Maps URL.
 * Accepts various Google Maps URL formats:
 *   - https://www.google.com/maps/place/...
 *   - https://maps.google.com/...
 *   - https://goo.gl/maps/...
 *   - https://www.google.com/maps?cid=...
 *
 * @param {string} url - The Google Maps URL to validate
 * @returns {{ url: string, placeId: string | null }} Validated URL and extracted place ID (if present)
 * @throws {Error} If the URL is not a valid Google Maps URL
 */
export function extractPlaceIdFromUrl(url) {
  if (!url || typeof url !== "string") {
    throw new Error("URL invalide : veuillez fournir une URL Google Maps.");
  }

  const trimmed = url.trim();

  // Accept raw place IDs (ChIJ...) directly
  if (/^ChIJ[A-Za-z0-9_-]+$/.test(trimmed)) {
    return { url: `https://www.google.com/maps/place/?q=place_id:${trimmed}`, placeId: trimmed };
  }

  // Match standard Google Maps URLs
  const validPatterns = [
    /^https?:\/\/(www\.)?google\.[a-z.]+\/maps/i,
    /^https?:\/\/maps\.google\.[a-z.]+/i,
    /^https?:\/\/goo\.gl\/maps\//i,
  ];

  const isValid = validPatterns.some((pattern) => pattern.test(trimmed));
  if (!isValid) {
    throw new Error(
      "URL invalide : l'URL doit être un lien Google Maps ou un Place ID (ex: ChIJ...)"
    );
  }

  // Try to extract place ID from the URL (format: /place/.../@.../data=...!1s0x...!...ChIJ...)
  // Place IDs start with "ChIJ" and are typically in the URL path or data parameter
  let placeId = null;

  // Check for place_id query parameter
  const placeIdParam = trimmed.match(/[?&]place_id=([^&]+)/);
  if (placeIdParam) {
    placeId = decodeURIComponent(placeIdParam[1]);
  }

  // Check for ChIJ-style place ID in the URL data segment
  if (!placeId) {
    const chijMatch = trimmed.match(/(ChIJ[A-Za-z0-9_-]+)/);
    if (chijMatch) {
      placeId = chijMatch[1];
    }
  }

  // Check for CID (customer ID) in URL
  if (!placeId) {
    const cidMatch = trimmed.match(/[?&]cid=(\d+)/);
    if (cidMatch) {
      placeId = `cid:${cidMatch[1]}`;
    }
  }

  return { url: trimmed, placeId };
}

/**
 * Extracts and filters reviews from Apify dataset items.
 * Exported for testing.
 *
 * @param {Array} items - Raw dataset items from Apify
 * @returns {{ filtered: Array, totalFiveStar: number }} Filtered reviews and count
 */
export function filterAndNormalizeReviews(items) {
  if (!items || items.length === 0) {
    return { filtered: [], totalFiveStar: 0, googleTotal: null, googleRating: null };
  }

  // The automation-lab actor returns flat review items (one per review)
  // The compass actor may return nested reviews — handle both for resilience
  let allReviews = [];
  let googleTotal = null;
  let googleRating = null;

  for (const item of items) {
    // Extract real Google totals from the place-level item
    if (item.reviewsCount != null && googleTotal === null) googleTotal = item.reviewsCount;
    if (item.totalScore != null && googleRating === null) googleRating = item.totalScore;

    if (item.reviews && Array.isArray(item.reviews)) {
      allReviews.push(...item.reviews);
    } else if (item.stars || item.rating) {
      allReviews.push(item);
    }
  }

  // Filter: 5-star only + must have review text
  const fiveStar = allReviews.filter((review) => {
    const rating = review.stars || review.rating || 0;
    const text = review.text || review.reviewText || "";
    return rating === 5 && sanitizeText(text).length > 0;
  });

  // Sort by date (newest first) and cap at MAX_REVIEWS
  fiveStar.sort((a, b) => {
    const dateA = new Date(a.publishedAtDate || a.publishedAt || a.date || 0);
    const dateB = new Date(b.publishedAtDate || b.publishedAt || b.date || 0);
    return dateB - dateA;
  });

  const topReviews = fiveStar.slice(0, MAX_REVIEWS);

  // Normalize output format with sanitized text
  const filtered = topReviews.map((review) => ({
    reviewerName: sanitizeText(
      review.reviewerName || review.name || review.author || "Anonyme"
    ),
    reviewText: sanitizeText(
      review.text || review.reviewText || ""
    ),
    rating: review.stars || review.rating || 5,
    publishedAt:
      review.publishedAt || review.publishedAtDate || review.date || null,
    reviewerPhotoUrl:
      review.reviewerPhotoUrl ||
      review.profilePhotoUrl ||
      null,
    reviewUrl:
      review.reviewUrl || review.reviewLink || null,
  }));

  return { filtered, totalFiveStar: fiveStar.length, googleTotal, googleRating };
}

/**
 * Scrapes Google reviews using Apify and returns filtered 5-star reviews.
 *
 * @param {string} googleMapsUrl - The Google Maps URL of the business
 * @returns {Promise<{ reviews: Array, totalFiveStar: number, runId: string }>}
 */
export async function scrapeGoogleReviews(googleMapsUrl, storedPlaceId = null) {
  // Validate the URL first
  const { url, placeId: extractedPlaceId } = extractPlaceIdFromUrl(googleMapsUrl);
  const placeId = storedPlaceId || extractedPlaceId;

  // Ensure API token is configured
  const apiToken = process.env.APIFY_API_TOKEN;
  if (!apiToken) {
    throw new Error(
      "APIFY_API_TOKEN manquant : ajoutez-le dans vos variables d'environnement."
    );
  }

  const client = new ApifyClient({ token: apiToken });

  // Build input: prefer placeIds (fast & reliable), fall back to startUrls
  const input = {
    maxReviews: APIFY_MAX_PER_PLACE,
    reviewsSort: "newest",
    language: "fr",
  };
  if (placeId && !placeId.startsWith("cid:")) {
    input.placeIds = [placeId];
  } else {
    input.startUrls = [{ url }];
  }

  let run;
  try {
    run = await client.actor(APIFY_REVIEWS_ACTOR).call(input);
  } catch (error) {
    if (error.message?.includes("401") || error.message?.includes("403")) {
      throw new Error(
        "Erreur d'authentification Apify : vérifiez votre APIFY_API_TOKEN."
      );
    }
    if (error.message?.includes("timeout") || error.message?.includes("TIMEOUT")) {
      throw new Error(
        "Le scraping a pris trop de temps (délai dépassé). Réessayez plus tard."
      );
    }
    throw new Error(
      `Erreur lors du scraping Apify : ${error.message || "erreur inconnue"}`
    );
  }

  const runId = run?.id || "unknown";

  // Fetch results from the dataset
  let items;
  try {
    const { items: datasetItems } = await client
      .dataset(run.defaultDatasetId)
      .listItems();
    items = datasetItems;
  } catch (error) {
    throw new Error(
      `Erreur lors de la récupération des résultats : ${error.message}`
    );
  }

  const { filtered, totalFiveStar, googleTotal, googleRating } = filterAndNormalizeReviews(items);

  return { reviews: filtered, totalFiveStar, googleTotal, googleRating, runId };
}

/**
 * Searches Google Maps for a business by name and returns the top result.
 * Uses compass/crawler-google-places (~$0.011 per lookup).
 *
 * @param {string} query - Business name + city (e.g. "Flora Morell Sophrologue Albi")
 * @returns {Promise<{ name, address, placeId, rating, reviewCount, category, url, imageUrl }>}
 */
export async function searchGooglePlace(query) {
  if (!query || typeof query !== "string" || query.trim().length < 3) {
    throw new Error("Veuillez saisir au moins 3 caractères.");
  }

  const apiToken = process.env.APIFY_API_TOKEN;
  if (!apiToken) {
    throw new Error(
      "APIFY_API_TOKEN manquant : ajoutez-le dans vos variables d'environnement."
    );
  }

  const client = new ApifyClient({ token: apiToken });

  let run;
  try {
    run = await client.actor(APIFY_PLACES_ACTOR).call({
      searchStringsArray: [query.trim()],
      maxCrawledPlacesPerSearch: 1,
      language: "fr",
    });
  } catch (error) {
    if (error.message?.includes("401") || error.message?.includes("403")) {
      throw new Error("Erreur d'authentification Apify.");
    }
    throw new Error(
      `Erreur lors de la recherche : ${error.message || "erreur inconnue"}`
    );
  }

  const { items } = await client
    .dataset(run.defaultDatasetId)
    .listItems();

  if (!items || items.length === 0) {
    return null;
  }

  const p = items[0];
  return {
    name: p.title || p.name || "Sans nom",
    address: p.address || null,
    placeId: p.placeId || null,
    rating: p.totalScore || null,
    reviewCount: p.reviewsCount || 0,
    category: p.categoryName || null,
    url: p.url || null,
    imageUrl: p.imageUrl || null,
  };
}
