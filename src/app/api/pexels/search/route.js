import { NextResponse } from "next/server";

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

// In-memory cache: key → { data, timestamp }
// Survives across requests within the same serverless instance (warm start)
const cache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCacheKey(query, page, perPage) {
  return `${query.trim().toLowerCase()}|${page}|${perPage}`;
}

/**
 * GET /api/pexels/search?query=...&page=1&per_page=80
 *
 * Proxies search requests to Pexels API to keep the key server-side.
 * Caches responses for 24h to minimize quota usage.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const page = searchParams.get("page") || "1";
    const perPage = searchParams.get("per_page") || "80";

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ photos: [], total_results: 0 });
    }

    if (!PEXELS_API_KEY) {
      return NextResponse.json(
        { error: "Pexels API key not configured." },
        { status: 500 }
      );
    }

    // Check cache first
    const cacheKey = getCacheKey(query, page, perPage);
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query.trim())}&page=${page}&per_page=${perPage}&locale=fr-FR`;
    const res = await fetch(url, {
      headers: { Authorization: PEXELS_API_KEY },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Pexels API error." },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Return only what the frontend needs
    const photos = (data.photos || []).map((p) => ({
      id: p.id,
      width: p.width,
      height: p.height,
      alt: p.alt || "",
      photographer: p.photographer,
      photographerUrl: p.photographer_url || "",
      url: p.url || "",
      src: {
        small: p.src.small,
        medium: p.src.medium,
        large2x: p.src.large2x,
        original: p.src.original,
      },
    }));

    const responseData = {
      photos,
      total_results: data.total_results || 0,
      page: data.page || 1,
    };

    // Store in cache
    cache.set(cacheKey, { data: responseData, timestamp: Date.now() });

    // Evict old entries if cache grows too large (> 500 entries)
    if (cache.size > 500) {
      const now = Date.now();
      for (const [key, val] of cache) {
        if (now - val.timestamp > CACHE_TTL) cache.delete(key);
      }
    }

    return NextResponse.json(responseData);
  } catch (err) {
    console.error("[GET /api/pexels/search]", err);
    return NextResponse.json({ photos: [], total_results: 0 }, { status: 500 });
  }
}
