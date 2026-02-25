import { NextResponse } from "next/server";
import { getSiteVerificationClient } from "@/lib/gsc-auth";

export async function POST(request) {
  try {
    const { siteUrl, email } = await request.json();

    if (!siteUrl || !email) {
      return NextResponse.json(
        { error: "siteUrl and email are required" },
        { status: 400 }
      );
    }

    const siteVerification = getSiteVerificationClient();

    // Get current owners
    const current = await siteVerification.webResource.get({
      id: siteUrl,
    });

    const currentOwners = current.data.owners || [];

    if (currentOwners.includes(email)) {
      return NextResponse.json({
        success: true,
        message: `${email} is already an owner`,
        owners: currentOwners,
      });
    }

    // Update with new owner added
    const updatedOwners = [...currentOwners, email];

    const res = await siteVerification.webResource.update({
      id: siteUrl,
      requestBody: {
        site: { type: "SITE", identifier: siteUrl },
        owners: updatedOwners,
      },
    });

    return NextResponse.json({
      success: true,
      owners: res.data.owners,
    });
  } catch (err) {
    console.error("[POST /api/admin/gsc/add-owner]", err);

    const message =
      err.errors?.[0]?.message || err.message || "Failed to add owner";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
