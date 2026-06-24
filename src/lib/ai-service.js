import { askAI, parseJSONFromAI } from "@/lib/ai";
import { cacheKey, getCached, setCached } from "@/lib/cache";

export async function aiGenerate({
  prompt,
  system,
  json = false,
  temperature,
  maxTokens,
  cache = true,
  ttlSeconds = 60 * 60 * 24 * 7, // 7 days
  namespace = "ai",
}) {
  const key = cacheKey(namespace, {
    prompt,
    system,
    json,
    temperature,
    maxTokens,
  });

  if (cache) {
    try {
      const hit = await getCached(key);
      if (hit != null) return { ...hit, cached: true };
    } catch {
      
    }
  }

  const { text, provider } = await askAI({
    prompt,
    system,
    json,
    temperature,
    maxTokens,
  });

  let data = null;
  if (json) {
    try {
      data = parseJSONFromAI(text);
    } catch {
      data = null; 
    }
  }

  const result = { text, data, provider };

  if (cache) {
    try {
      await setCached(key, result, { ttlSeconds, provider });
    } catch {
      // Saving to cache 
    }
  }

  return { ...result, cached: false };
}