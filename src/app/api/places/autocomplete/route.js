import { NextResponse } from "next/server";

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

/**
 * POST /api/places/autocomplete
 *
 * Uses Google Place Autocomplete — Per Request ($2.83/1,000).
 * Debounced on the client side (400ms) to minimize calls.
 * Restricted to French-speaking countries + establishments only.
 */
export async function POST(request) {
  try {
    const { input } = await request.json();

    if (!input || input.trim().length < 5) {
      return NextResponse.json({ predictions: [] });
    }

    const params = new URLSearchParams({
      input: input.trim(),
      types: "establishment",
      components: "country:fr|country:be|country:ch|country:lu",
      language: "fr",
      key: GOOGLE_API_KEY,
    });

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK" || !data.predictions?.length) {
      return NextResponse.json({ predictions: [] });
    }

    // Return only what the frontend needs
    const predictions = data.predictions.slice(0, 5).map((p) => ({
      placeId: p.place_id,
      name: p.structured_formatting?.main_text || p.description,
      address: p.structured_formatting?.secondary_text || "",
    }));

    return NextResponse.json({ predictions });
  } catch (err) {
    console.error("[POST /api/places/autocomplete]", err);
    return NextResponse.json({ predictions: [] }, { status: 500 });
  }
}
