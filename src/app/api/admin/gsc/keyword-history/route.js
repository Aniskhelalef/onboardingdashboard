import { NextResponse } from "next/server";
import { getWebmastersClient } from "@/lib/gsc-auth";

export async function POST(request) {
  try {
    const { siteUrl, keyword } = await request.json();

    if (!siteUrl) {
      return NextResponse.json({ error: "siteUrl is required" }, { status: 400 });
    }

    const webmasters = getWebmastersClient();

    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 3);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 90);

    const requestBody = {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      dimensions: ["date"],
      rowLimit: 5000,
    };

    // If a keyword is specified, filter by it
    if (keyword) {
      requestBody.dimensionFilterGroups = [
        {
          filters: [
            { dimension: "query", operator: "equals", expression: keyword },
          ],
        },
      ];
    }

    const res = await webmasters.searchanalytics.query({
      siteUrl,
      requestBody,
    });

    const rows = res.data.rows || [];

    // Sort by date ascending
    rows.sort((a, b) => a.keys[0].localeCompare(b.keys[0]));

    const history = rows.map((row) => ({
      date: row.keys[0],
      position: Math.round(row.position * 10) / 10,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: Math.round(row.ctr * 1000) / 10,
    }));

    // Aggregate summary
    const totalClicks = rows.reduce((s, r) => s + r.clicks, 0);
    const totalImpressions = rows.reduce((s, r) => s + r.impressions, 0);
    const avgPosition =
      rows.length > 0
        ? Math.round(
            (rows.reduce((s, r) => s + r.position, 0) / rows.length) * 10
          ) / 10
        : null;

    return NextResponse.json({
      keyword: keyword || "(all queries)",
      history,
      totalClicks,
      totalImpressions,
      avgPosition,
      dataPoints: history.length,
    });
  } catch (err) {
    console.error("[POST /api/admin/gsc/keyword-history]", err);

    const message =
      err.errors?.[0]?.message || err.message || "Failed to fetch keyword history";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
