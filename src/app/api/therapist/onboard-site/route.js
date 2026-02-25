import { NextResponse } from "next/server";
import { onboardSite } from "@/services/searchConsole";

export const dynamic = "force-dynamic";

/**
 * POST /api/therapist/onboard-site
 *
 * Two-step flow:
 *
 * 1) First call: { siteUrl }
 *    → Returns the verification file name + content to serve on the client site.
 *
 * 2) Second call: { siteUrl, fileReady: true }
 *    → Verifies ownership + adds site to Search Console.
 *    → Data starts flowing within 24-48h.
 */
export async function POST(request) {
  try {
    const { siteUrl, fileReady } = await request.json();

    if (!siteUrl) {
      return NextResponse.json({ ok: false, error: "siteUrl est requis." }, { status: 400 });
    }

    // Ensure URL has trailing slash (SC convention)
    const normalizedUrl = siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`;

    const result = await onboardSite(normalizedUrl, !!fileReady);

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[POST /api/therapist/onboard-site]", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
