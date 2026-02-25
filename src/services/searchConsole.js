import { google } from "googleapis";

/**
 * Google Search Console Service
 * Uses a Service Account to access client Search Console data.
 * The service account must be added as a reader on each SC property.
 */

function getAuth(scopes) {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GSC_CLIENT_EMAIL,
      private_key: process.env.GSC_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: scopes || ["https://www.googleapis.com/auth/webmasters.readonly"],
  });
}

const ONBOARDING_SCOPES = [
  "https://www.googleapis.com/auth/webmasters",          // SC read+write
  "https://www.googleapis.com/auth/siteverification",     // Site Verification
];

/**
 * List all Search Console properties the service account has access to.
 */
export async function listProperties() {
  const auth = getAuth();
  const searchconsole = google.searchconsole({ version: "v1", auth });

  const res = await searchconsole.sites.list();
  return res.data.siteEntry || [];
}

/**
 * Fetch top keyword rankings for a given site.
 * @param {string} siteUrl - The SC property URL (e.g. "https://example.com" or "sc-domain:example.com")
 * @param {object} options
 * @param {string} options.startDate - YYYY-MM-DD
 * @param {string} options.endDate   - YYYY-MM-DD
 * @param {number} options.rowLimit  - Max rows (default 10)
 */
export async function getTopKeywords(siteUrl, { startDate, endDate, rowLimit = 10 } = {}) {
  const auth = getAuth();
  const searchconsole = google.searchconsole({ version: "v1", auth });

  // Default to last 28 days
  if (!endDate) {
    const d = new Date();
    d.setDate(d.getDate() - 3); // SC data has ~3 day delay
    endDate = d.toISOString().split("T")[0];
  }
  if (!startDate) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - 28);
    startDate = d.toISOString().split("T")[0];
  }

  const res = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ["query"],
      rowLimit,
      type: "web",
    },
  });

  return (res.data.rows || []).map((row) => ({
    keyword: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
  }));
}

/**
 * Get the monthly average position of a keyword over the last N months.
 * Returns an array of { month: "Fév", year: 2026, position: 3.2 } sorted oldest→newest.
 *
 * @param {string} siteUrl - SC property URL
 * @param {string} keyword - The exact keyword to track
 * @param {number} months  - How many months back (default 12, max 16)
 */
export async function getKeywordHistory(siteUrl, keyword, months = 12) {
  const auth = getAuth();
  const searchconsole = google.searchconsole({ version: "v1", auth });

  const end = new Date();
  end.setDate(end.getDate() - 3); // SC data delay
  const start = new Date(end);
  start.setMonth(start.getMonth() - months);

  const res = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
      dimensions: ["query", "date"],
      dimensionFilterGroups: [
        {
          filters: [{ dimension: "query", operator: "equals", expression: keyword }],
        },
      ],
      rowLimit: 25000,
      type: "web",
    },
  });

  // Group daily rows by month
  const monthLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
  const buckets = {};

  for (const row of res.data.rows || []) {
    const date = row.keys[1]; // YYYY-MM-DD
    const key = date.slice(0, 7); // YYYY-MM
    if (!buckets[key]) buckets[key] = { positions: [], clicks: 0, impressions: 0 };
    buckets[key].positions.push(row.position);
    buckets[key].clicks += row.clicks;
    buckets[key].impressions += row.impressions;
  }

  // Sort by month key and build result
  return Object.keys(buckets)
    .sort()
    .map((key) => {
      const [y, m] = key.split("-");
      const b = buckets[key];
      const avg = b.positions.reduce((a, c) => a + c, 0) / b.positions.length;
      return {
        month: monthLabels[parseInt(m, 10) - 1],
        year: parseInt(y, 10),
        position: Math.round(avg * 10) / 10,
        clicks: b.clicks,
        impressions: b.impressions,
      };
    });
}

// ─────────────────────────────────────────────
// Auto-onboarding: verify site + add to SC
// ─────────────────────────────────────────────

/**
 * Step 1: Get the verification token (HTML file method).
 * Returns { fileName, fileContent } to be served at https://site.com/{fileName}
 */
export async function getVerificationToken(siteUrl) {
  const auth = getAuth(ONBOARDING_SCOPES);
  const siteVerification = google.siteVerification({ version: "v1", auth });

  const res = await siteVerification.webResource.getToken({
    requestBody: {
      site: { type: "SITE", identifier: siteUrl },
      verificationMethod: "FILE",
    },
  });

  // Token looks like "google1234abcd.html"
  return {
    fileName: res.data.token,
    fileContent: `google-site-verification: ${res.data.token}`,
  };
}

/**
 * Step 2: Verify ownership of the site (call after the HTML file is served).
 * Returns true on success.
 */
export async function verifySite(siteUrl) {
  const auth = getAuth(ONBOARDING_SCOPES);
  const siteVerification = google.siteVerification({ version: "v1", auth });

  await siteVerification.webResource.insert({
    verificationMethod: "FILE",
    requestBody: {
      site: { type: "SITE", identifier: siteUrl },
    },
  });

  return true;
}

/**
 * Step 3: Add the verified site to Search Console.
 * Data starts flowing within 24-48h after this.
 */
export async function addSiteToSearchConsole(siteUrl) {
  const auth = getAuth(ONBOARDING_SCOPES);
  const searchconsole = google.searchconsole({ version: "v1", auth });

  await searchconsole.sites.add({ siteUrl });
  return true;
}

/**
 * Full onboarding pipeline.
 * Returns { token } if waiting for file placement, or { verified: true } if complete.
 *
 * @param {string} siteUrl - e.g. "https://sophrologue-albi.fr"
 * @param {boolean} fileReady - true when the verification file is already served
 */
export async function onboardSite(siteUrl, fileReady = false) {
  // Step 1: Get verification token
  const token = await getVerificationToken(siteUrl);

  if (!fileReady) {
    // Return token so the platform can serve the file
    return {
      status: "pending_file",
      fileName: token.fileName,
      fileContent: token.fileContent,
      instruction: `Serve this file at ${siteUrl}/${token.fileName}`,
    };
  }

  // Step 2: Verify
  await verifySite(siteUrl);

  // Step 3: Add to Search Console
  await addSiteToSearchConsole(siteUrl);

  return { status: "verified", siteUrl };
}
