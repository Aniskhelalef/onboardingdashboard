import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/**
 * GET /api/analytics/[therapistId]?from=2026-01-01&to=2026-02-28
 *
 * Returns:
 *   - visits:      unique session count (= page visits)
 *   - clickSessions: unique sessions that clicked a CTA (= "Clics RDV")
 *   - clicksByPlacement: { navbar: 5, hero: 12, ... }
 *   - totalClicks:  raw total click count
 */
export async function GET(request, { params }) {
  try {
    const { therapistId } = params;

    if (!therapistId) {
      return NextResponse.json({ error: "therapistId requis." }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from"); // ISO date string
    const to = searchParams.get("to");     // ISO date string

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Build query — fetch all events for this therapist in range
    let query = supabase
      .from("cta_events")
      .select("session_id, event_type, placement, created_at")
      .eq("therapist_id", therapistId)
      .order("created_at", { ascending: false });

    if (from) query = query.gte("created_at", new Date(from).toISOString());
    if (to) query = query.lte("created_at", new Date(to + "T23:59:59.999Z").toISOString());

    const { data: events, error } = await query;

    if (error) {
      console.error("[GET /api/analytics]", error);
      return NextResponse.json({ error: "Erreur base de données." }, { status: 500 });
    }

    // Compute metrics
    const clickSessionSet = new Set();
    const clicksByPlacement = {};
    let totalViews = 0;
    let totalClicks = 0;

    for (const e of events) {
      if (e.event_type === "page_view") {
        totalViews++;
      } else {
        clickSessionSet.add(e.session_id);
        if (e.placement) {
          clicksByPlacement[e.placement] = (clicksByPlacement[e.placement] || 0) + 1;
        }
        totalClicks++;
      }
    }

    return NextResponse.json({
      therapistId,
      from: from || null,
      to: to || null,
      visits: totalViews,
      clickSessions: clickSessionSet.size,
      totalClicks,
      clicksByPlacement,
    });
  } catch (err) {
    console.error("[GET /api/analytics]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
