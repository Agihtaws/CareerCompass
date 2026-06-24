import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Why this file looks the way it does:
 *
 * On Vercel, each API route runs in a short-lived serverless function.
 * Those functions get reused between requests, but if we called
 * mongoose.connect() on every request we would quickly open hundreds of
 * connections and exhaust the free MongoDB tier.
 *
 * The fix is to cache the connection on Node's global object so it survives
 * across invocations and is only created once.
 */

let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. Copy .env.example to .env.local and add your connection string."
    );
  }

  // Already connected — reuse it.
  if (cached.conn) return cached.conn;

  // A connection is being established — wait for that same promise.
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}