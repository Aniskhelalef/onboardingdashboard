/**
 * Auth helper — placeholder until a real auth system is in place.
 *
 * TODO: Replace this with your actual authentication logic.
 * Options:
 *   - Supabase Auth (supabase.auth.getUser())
 *   - NextAuth.js session
 *   - JWT from Authorization header
 *
 * For now, reads therapist ID from the X-Therapist-Id header (dev only).
 */

/**
 * Extracts the therapist ID from the request.
 * @param {Request} request
 * @returns {Promise<string | null>}
 */
export async function getTherapistId(request) {
  // TODO: Replace with real auth. For development, use the header.
  const therapistId = request.headers.get("x-therapist-id");
  return therapistId || null;
}
