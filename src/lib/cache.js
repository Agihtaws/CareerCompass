import crypto from "node:crypto";
import { connectToDatabase } from "@/lib/mongodb";
import { Cache } from "@/models/Cache";

export function cacheKey(namespace, payload) {
  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
  return `${namespace}:${hash}`;
}

/** Return the cached value for a key, or null if it isn't there. */
export async function getCached(key) {
  await connectToDatabase();
  const doc = await Cache.findOne({ key }).lean();
  return doc ? doc.value : null;
}

/** Store a value under a key, optionally with a time-to-live in seconds. */
export async function setCached(key, value, { ttlSeconds, provider } = {}) {
  await connectToDatabase();
  const update = { key, value, provider: provider ?? null };
  if (ttlSeconds) {
    update.expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  }
  await Cache.findOneAndUpdate({ key }, update, { upsert: true });
}