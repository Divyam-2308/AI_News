import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Initializes the Firebase Admin SDK once and returns the Firestore client.
 *
 * Requires env vars (webApp/.env.local for local dev, platform env for prod):
 *   FIREBASE_PROJECT_ID        e.g. ai-news-f840e
 *   FIREBASE_SERVICE_ACCOUNT   the service account JSON (or base64-encoded JSON)
 */
function parseServiceAccount(raw: string): string {
  try {
    JSON.parse(raw);
    return raw;
  } catch {
    return Buffer.from(raw, "base64").toString("utf-8");
  }
}

export function getAdminFirestore() {
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (!projectId || !serviceAccount) {
      throw new Error(
        "FIREBASE_PROJECT_ID and FIREBASE_SERVICE_ACCOUNT must be set " +
          "(see webApp/.env.local)."
      );
    }

    initializeApp({
      projectId,
      credential: cert(JSON.parse(parseServiceAccount(serviceAccount))),
    });
  }

  return getFirestore();
}