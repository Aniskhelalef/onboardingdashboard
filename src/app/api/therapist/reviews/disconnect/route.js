import { NextResponse } from "next/server";
import { getSourceByTherapistId } from "@/repositories/googleReviews";
import { supabase } from "@/lib/supabase";
import { getTherapistId } from "@/lib/auth";

/**
 * POST /api/therapist/reviews/disconnect
 *
 * Deletes the review source and all associated reviews for a therapist.
 */
export async function POST(request) {
  try {
    const therapistId = await getTherapistId(request);
    if (!therapistId) {
      return NextResponse.json(
        { error: "Non authentifié." },
        { status: 401 }
      );
    }

    const source = await getSourceByTherapistId(therapistId);
    if (!source) {
      return NextResponse.json({ success: true, message: "Aucune source connectée." });
    }

    // Delete source (reviews cascade via FK)
    const { error } = await supabase
      .from("google_review_sources")
      .delete()
      .eq("id", source.id);

    if (error) {
      throw new Error(`Erreur suppression source : ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "Source déconnectée avec succès.",
    });
  } catch (err) {
    console.error("[POST /api/therapist/reviews/disconnect]", err);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
