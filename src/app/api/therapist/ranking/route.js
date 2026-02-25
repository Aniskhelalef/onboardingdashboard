import { NextResponse } from "next/server";
import { listProperties, getKeywordHistory, getTopKeywords } from "@/services/searchConsole";

export const dynamic = "force-dynamic";

/**
 * GET /api/therapist/ranking?siteUrl=...&keyword=...
 *
 * Returns monthly position history for a keyword on a given site.
 * If no keyword is provided, picks the top keyword by clicks.
 * If no siteUrl is provided, uses the first property accessible.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let siteUrl = searchParams.get("siteUrl");
    let keyword = searchParams.get("keyword");

    // Auto-detect site if not provided
    if (!siteUrl) {
      const props = await listProperties();
      if (!props.length) {
        return NextResponse.json({ ok: false, error: "Aucune propriété Search Console trouvée." });
      }
      siteUrl = props[0].siteUrl;
    }

    // Fetch all top keywords
    const allKeywords = await getTopKeywords(siteUrl, { rowLimit: 10 });
    if (!allKeywords.length) {
      return NextResponse.json({ ok: false, error: "Aucune donnée de mots-clés trouvée." });
    }

    // Use provided keyword or the top one for the chart
    if (!keyword) {
      keyword = allKeywords[0].keyword;
    }

    const history = await getKeywordHistory(siteUrl, keyword, 12);

    // Current position = last month's average
    const current = history.length ? history[history.length - 1].position : null;
    const first = history.length ? history[0].position : null;
    const change = first !== null && current !== null ? Math.round((first - current) * 10) / 10 : 0;

    return NextResponse.json({
      ok: true,
      siteUrl,
      keyword,
      current: current !== null ? Math.round(current) : null,
      change: Math.round(change),
      history,
      keywords: allKeywords.map((k) => ({
        keyword: k.keyword,
        position: Math.round(k.position * 10) / 10,
        clicks: k.clicks,
        impressions: k.impressions,
      })),
    });
  } catch (err) {
    console.error("[GET /api/therapist/ranking]", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
