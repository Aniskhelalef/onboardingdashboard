import { NextResponse } from "next/server";
import { getWebmastersClient } from "@/lib/gsc-auth";

export async function POST(request) {
  try {
    const { siteUrl } = await request.json();

    if (!siteUrl) {
      return NextResponse.json({ error: "siteUrl is required" }, { status: 400 });
    }

    const webmasters = getWebmastersClient();
    await webmasters.sites.add({ siteUrl });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/admin/gsc/add-to-gsc]", err);

    const message = err.errors?.[0]?.message || err.message || "Failed to add site";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
