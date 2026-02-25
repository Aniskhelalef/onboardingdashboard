import { NextResponse } from "next/server";
import { getWebmastersClient } from "@/lib/gsc-auth";

export async function POST(request) {
  try {
    const { siteUrl } = await request.json();

    if (!siteUrl) {
      return NextResponse.json({ error: "siteUrl is required" }, { status: 400 });
    }

    const webmasters = getWebmastersClient();
    const base = siteUrl.replace(/\/+$/, "");
    const sitemapPaths = [`${base}/sitemap.xml`, `${base}/sitemap_index.xml`];
    const submitted = [];

    for (const feedpath of sitemapPaths) {
      try {
        await webmasters.sitemaps.submit({ siteUrl, feedpath });
        submitted.push(feedpath);
      } catch (err) {
        // Silently skip if one fails (e.g. sitemap_index doesn't exist)
        console.warn(`[submit-sitemap] Failed for ${feedpath}:`, err.message);
      }
    }

    return NextResponse.json({ success: true, sitemaps: submitted });
  } catch (err) {
    console.error("[POST /api/admin/gsc/submit-sitemap]", err);

    const message = err.errors?.[0]?.message || err.message || "Failed to submit sitemaps";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
