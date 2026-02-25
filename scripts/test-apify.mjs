/**
 * Test script for the Apify Google Reviews integration.
 *
 * Usage:
 *   APIFY_API_TOKEN=your_token node scripts/test-apify.mjs [google_maps_url]
 *
 * If no URL is provided, a default test URL is used.
 */

import { scrapeGoogleReviews, extractPlaceIdFromUrl } from "../src/services/googleReviews.js";

const DEFAULT_TEST_URL =
  "https://www.google.com/maps/place/Doctolib/@48.8737815,2.3501649,17z/";

async function main() {
  const testUrl = process.argv[2] || DEFAULT_TEST_URL;

  console.log("=== Test Apify Google Reviews Scraper ===\n");

  // Test 1: URL validation
  console.log("1. Test de validation d'URL...");
  try {
    const result = extractPlaceIdFromUrl(testUrl);
    console.log("   URL valide :", result.url);
    console.log("   Place ID :", result.placeId || "(non trouvé dans l'URL)");
    console.log("   ✓ Validation OK\n");
  } catch (error) {
    console.error("   ✗ Erreur :", error.message, "\n");
    process.exit(1);
  }

  // Test 2: Invalid URL should throw
  console.log("2. Test d'URL invalide...");
  try {
    extractPlaceIdFromUrl("https://example.com/not-google-maps");
    console.error("   ✗ Devrait avoir échoué\n");
    process.exit(1);
  } catch (error) {
    console.log("   ✓ Erreur attendue :", error.message, "\n");
  }

  // Test 3: Scraping reviews (requires valid APIFY_API_TOKEN)
  console.log("3. Test du scraping des avis (nécessite APIFY_API_TOKEN)...");
  if (!process.env.APIFY_API_TOKEN) {
    console.log(
      "   ⚠ APIFY_API_TOKEN non défini. Passez-le en variable d'environnement.\n" +
      "   Exemple : APIFY_API_TOKEN=apify_api_xxx node scripts/test-apify.mjs\n"
    );
    console.log("=== Tests de validation terminés (scraping non testé) ===");
    return;
  }

  try {
    console.log("   Scraping en cours (peut prendre 30-60 secondes)...");
    const reviews = await scrapeGoogleReviews(testUrl);
    console.log(`   ✓ ${reviews.length} avis 5 étoiles trouvés\n`);

    if (reviews.length > 0) {
      console.log("   Premier avis :");
      console.log("   - Nom :", reviews[0].reviewerName);
      console.log("   - Note :", reviews[0].rating, "★");
      console.log("   - Date :", reviews[0].publishedAt);
      console.log(
        "   - Texte :",
        reviews[0].reviewText.substring(0, 100) +
          (reviews[0].reviewText.length > 100 ? "..." : "")
      );
      console.log("   - Photo :", reviews[0].reviewerPhotoUrl || "N/A");
      console.log("   - Lien :", reviews[0].reviewUrl || "N/A");
    }
  } catch (error) {
    console.error("   ✗ Erreur :", error.message);
    process.exit(1);
  }

  console.log("\n=== Tous les tests sont passés ===");
}

main();
