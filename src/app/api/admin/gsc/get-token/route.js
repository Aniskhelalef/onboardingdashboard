import { NextResponse } from "next/server";
import { getSiteVerificationClient } from "@/lib/gsc-auth";

export async function POST(request) {
  try {
    const { domain } = await request.json();

    if (!domain) {
      return NextResponse.json({ error: "domain is required" }, { status: 400 });
    }

    // Normalize: strip protocol, www, trailing slash → https://bare-domain
    const bare = domain
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/+$/, "");
    const siteUrl = `https://${bare}`;

    const siteVerification = getSiteVerificationClient();

    const res = await siteVerification.webResource.getToken({
      requestBody: {
        site: { type: "SITE", identifier: siteUrl },
        verificationMethod: "META",
      },
    });

    const token = res.data.token;
    const metaTag = `<meta name="google-site-verification" content="${token}" />`;

    return NextResponse.json({ token, metaTag, siteUrl });
  } catch (err) {
    console.error("[POST /api/admin/gsc/get-token]", err);

    const message = err.message || "Unknown error";
    if (message.includes("not found at")) {
      return NextResponse.json({ error: message }, { status: 500 });
    }
    if (err.code === 403 || message.includes("not enabled")) {
      return NextResponse.json(
        {
          error:
            "Google Site Verification API is not enabled. Enable it at https://console.cloud.google.com/apis",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
