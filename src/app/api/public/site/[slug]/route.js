import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Disable all Next.js/Vercel caching
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

/**
 * GET /api/public/site/[slug]
 *
 * Fetches published site data by slug. Public, no auth needed.
 */
export async function GET(request, { params }) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json({ error: "Slug requis." }, { status: 400 });
    }

    // Create a fresh client per request to avoid any caching
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { global: { fetch: (url, opts) => fetch(url, { ...opts, cache: "no-store" }) } }
    );

    const { data: site, error } = await supabase
      .from("therapist_sites")
      .select("data, updated_at")
      .eq("slug", slug)
      .eq("published", true)
      .single();

    if (error || !site) {
      return NextResponse.json({ error: "Site introuvable." }, { status: 404 });
    }

    return NextResponse.json(
      { data: site.data, updatedAt: site.updated_at },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
    );
  } catch (err) {
    console.error("[GET /api/public/site]", err);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
