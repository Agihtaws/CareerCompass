import { NextResponse } from "next/server";
import { aiGenerate } from "@/lib/ai-service";

export const dynamic = "force-dynamic";
export const maxDuration = 30; // give the model up to 30s to respond

/**
 * POST /api/ai
 * Body: { prompt, system?, json?, cache?, temperature?, maxTokens? }
 * Returns: { text, data, provider, cached }
 *
 * Your API keys live only on the server, so the browser never sees them.
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { prompt, system, json, cache, temperature, maxTokens } = body || {};

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json(
      { error: "A 'prompt' string is required." },
      { status: 400 }
    );
  }
  if (prompt.length > 8000) {
    return NextResponse.json(
      { error: "Prompt is too long (max 8000 characters)." },
      { status: 400 }
    );
  }

  try {
    const result = await aiGenerate({
      prompt,
      system: typeof system === "string" ? system : undefined,
      json: Boolean(json),
      cache: cache !== false,
      temperature,
      maxTokens,
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: "AI request failed.", detail: e.message },
      { status: 502 }
    );
  }
}