
async function callGemini({ prompt, system, json, temperature, maxTokens }) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("no API key");

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: temperature ?? 0.7,
      maxOutputTokens: maxTokens ?? 1024,
      
      thinkingConfig: { thinkingBudget: 0 },
      ...(json ? { responseMimeType: "application/json" } : {}),
    },
  };
  if (system) body.system_instruction = { parts: [{ text: system }] };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Gemini ${res.status}: ${t.slice(0, 200)}`);
  }

  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";
  if (!text) throw new Error("empty response");
  return text;
}


async function callMistral({ prompt, system, json, temperature, maxTokens }) {
  const key = process.env.MISTRAL_API_KEY;
  if (!key) throw new Error("no API key");

  const model = process.env.MISTRAL_MODEL || "mistral-small-latest";
  const messages = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: prompt });

  const body = {
    model,
    messages,
    temperature: temperature ?? 0.7,
    max_tokens: maxTokens ?? 1024,
  };
  if (json) body.response_format = { type: "json_object" };

  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Mistral ${res.status}: ${t.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("empty response");
  return text;
}

async function callGrok({ prompt, system, json, temperature }) {
  const key = process.env.GROK_API_KEY;
  if (!key) throw new Error("no API key");

  const model = process.env.GROK_MODEL || "grok-3";
  const messages = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: prompt });


  const body = { model, messages, temperature: temperature ?? 0.7 };
  if (json) body.response_format = { type: "json_object" };

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Grok ${res.status}: ${t.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("empty response");
  return text;
}

const PROVIDERS = [
  { name: "gemini", call: callGemini },
  { name: "mistral", call: callMistral },
  { name: "grok", call: callGrok },
];


export async function askAI(opts) {
  const errors = [];
  for (const provider of PROVIDERS) {
    try {
      const text = await provider.call(opts);
      return { text, provider: provider.name };
    } catch (e) {
      errors.push(`${provider.name}: ${e.message}`);
    }
  }
  throw new Error(`All AI providers failed → ${errors.join(" | ")}`);
}

export function parseJSONFromAI(text) {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  return JSON.parse(cleaned);
}