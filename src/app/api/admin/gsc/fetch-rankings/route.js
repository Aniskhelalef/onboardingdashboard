import { NextResponse } from "next/server";
import { getWebmastersClient } from "@/lib/gsc-auth";

export async function POST(request) {
  try {
    const { siteUrl } = await request.json();

    if (!siteUrl) {
      return NextResponse.json({ error: "siteUrl is required" }, { status: 400 });
    }

    const webmasters = getWebmastersClient();

    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 3); // GSC has 2-3 day delay
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 90);

    const res = await webmasters.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        dimensions: ["query"],
        rowLimit: 25,
      },
    });

    const rows = res.data.rows || [];

    // Sort by impressions descending
    rows.sort((a, b) => b.impressions - a.impressions);

    const keywords = rows.map((row) => ({
      query: row.keys[0],
      position: Math.round(row.position * 10) / 10,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: Math.round(row.ctr * 1000) / 10, // percentage with 1 decimal
    }));

    return NextResponse.json({ keywords, totalKeywords: keywords.length });
  } catch (err) {
    console.error("[POST /api/admin/gsc/fetch-rankings]", err);

    const message = err.errors?.[0]?.message || err.message || "Failed to fetch rankings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
