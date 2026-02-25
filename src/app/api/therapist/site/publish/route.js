import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * POST /api/therapist/site/publish
 *
 * Body: { slug?: string, data: object }
 * Upserts site data into therapist_sites table.
 * If no slug provided, generates a random one.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { data } = body;

    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { error: "Le champ data est requis." },
        { status: 400 }
      );
    }

    // Use provided slug or generate a random one
    let slug = body.slug || null;

    if (slug) {
      // Upsert: update if exists, create if not
      const { error } = await supabase
        .from("therapist_sites")
        .upsert(
          { slug, data, published: true, updated_at: new Date().toISOString() },
          { onConflict: "slug" }
        );

      if (error) throw error;
    } else {
      // Generate random slug
      slug = Math.random().toString(36).substring(2, 10);

      const { error } = await supabase
        .from("therapist_sites")
        .insert({ slug, data, published: true });

      if (error) throw error;
    }

    return NextResponse.json({ slug, url: `/site/${slug}` });
  } catch (err) {
    console.error("[POST /api/therapist/site/publish]", err);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
