import { NextResponse } from "next/server";
import { getSiteVerificationClient } from "@/lib/gsc-auth";

export async function POST(request) {
  try {
    const { siteUrl } = await request.json();

    if (!siteUrl) {
      return NextResponse.json({ error: "siteUrl is required" }, { status: 400 });
    }

    const siteVerification = getSiteVerificationClient();

    await siteVerification.webResource.insert({
      verificationMethod: "META",
      requestBody: {
        site: { type: "SITE", identifier: siteUrl },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/admin/gsc/verify]", err);

    const googleError =
      err.errors?.[0]?.message || err.message || "Verification failed";

    return NextResponse.json({ success: false, error: googleError }, { status: 400 });
  }
}
