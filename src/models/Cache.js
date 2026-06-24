import mongoose from "mongoose";

/**
 * A simple key/value cache stored in MongoDB.
 * - `key`      a unique hash of the request
 * - `value`    whatever we cached (text, or parsed JSON, etc.)
 * - `expiresAt` when this entry should auto-delete (handled by MongoDB's TTL)
 */
const cacheSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    provider: { type: String, default: null },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// MongoDB automatically removes a document once expiresAt has passed.
// Entries with expiresAt = null are kept forever.
cacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Reuse the model across hot reloads / serverless invocations.
export const Cache =
  mongoose.models.Cache || mongoose.model("Cache", cacheSchema);