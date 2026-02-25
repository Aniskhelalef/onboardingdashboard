import { google } from "googleapis";
import fs from "fs";
import path from "path";

const SCOPES = [
  "https://www.googleapis.com/auth/siteverification",
  "https://www.googleapis.com/auth/webmasters",
];

let _cachedAuth = null;

function getKeyPath() {
  return (
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH ||
    "./config/service-account-key.json"
  );
}

function loadServiceAccountKey() {
  const keyPath = getKeyPath();
  const resolved = path.resolve(keyPath);

  if (!fs.existsSync(resolved)) {
    throw new Error(
      `Service account key not found at ${resolved}. ` +
        `Set GOOGLE_SERVICE_ACCOUNT_KEY_PATH or place the key at ./config/service-account-key.json`
    );
  }

  return JSON.parse(fs.readFileSync(resolved, "utf-8"));
}

function getAuth() {
  if (_cachedAuth) return _cachedAuth;

  const key = loadServiceAccountKey();
  _cachedAuth = new google.auth.GoogleAuth({
    credentials: {
      client_email: key.client_email,
      private_key: key.private_key,
    },
    scopes: SCOPES,
  });

  return _cachedAuth;
}

export function getSiteVerificationClient() {
  return google.siteVerification({ version: "v1", auth: getAuth() });
}

export function getWebmastersClient() {
  return google.webmasters({ version: "v3", auth: getAuth() });
}
