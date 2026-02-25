import { NextResponse } from "next/server";
import { listProperties, getTopKeywords } from "@/services/searchConsole";

export const dynamic = "force-dynamic";

/**
 * GET /api/test-gsc
 *
 * Test endpoint — lists all SC properties the service account can access,
 * then fetches top 10 keywords for the first property found.
 * Delete this route once integration is confirmed working.
 */
export async function GET() {
  try {
    // 1. List all properties
    const properties = await listProperties();

    if (!properties.length) {
      return NextResponse.json({
        ok: false,
        message:
          "Aucune propriété trouvée. As-tu ajouté le compte de service comme utilisateur dans Search Console ?",
        serviceAccount: process.env.GSC_CLIENT_EMAIL,
      });
    }

    // 2. Fetch top keywords for the first property
    const firstSite = properties[0].siteUrl;
    const keywords = await getTopKeywords(firstSite);

    return NextResponse.json({
      ok: true,
      properties: properties.map((p) => ({
        siteUrl: p.siteUrl,
        permissionLevel: p.permissionLevel,
      })),
      sample: {
        siteUrl: firstSite,
        keywords,
      },
    });
  } catch (err) {
    console.error("[GET /api/test-gsc]", err);
    return NextResponse.json(
      {
        ok: false,
        error: err.message,
        hint: "Vérifie que le compte de service est bien ajouté dans Search Console et que les credentials sont correctes.",
      },
      { status: 500 }
    );
  }
}
