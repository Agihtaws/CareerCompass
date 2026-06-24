import { aiGenerate } from "@/lib/ai-service";

const MAX_DOC = 12000; // keep token use sane

export async function chatReply(messages) {
  const history = messages
    .filter((m) => m && typeof m.content === "string")
    .slice(-12)
    .map((m) => `${m.role === "assistant" ? "Assistant" : "Student"}: ${m.content}`)
    .join("\n");

  const ai = await aiGenerate({
    cache: false,
    maxTokens: 800,
    system:
      "You are a kind, patient tutor for students in India. Explain things in SIMPLE, clear English with short sentences. Clear their doubts step by step, give small everyday examples, and gently define any hard words. You may use **bold** for key terms and bullet points for lists. Stay warm and encouraging, and don't make answers longer than they need to be.",
    prompt: `${history}\nAssistant:`,
  });
  return { reply: ai.text };
}

export async function summarizeText(text) {
  const ai = await aiGenerate({
    cache: false,
    maxTokens: 600,
    system: "You summarize study material clearly for students.",
    prompt:
      `Summarize the following in up to 6 short bullet points a student can revise from, ` +
      `then a final line starting "Key takeaway: ".\n\n"""${text.slice(0, MAX_DOC)}"""`,
  });
  return { summary: ai.text };
}

export async function answerAboutText({ question, text }) {
  const ai = await aiGenerate({
    cache: false,
    maxTokens: 600,
    system:
      "Answer using ONLY the document provided. If the answer isn't in it, say you couldn't find it in the document. Explain in simple, clear English. You may use **bold** and bullet points.",
    prompt: `Document:\n"""${text.slice(0, MAX_DOC)}"""\n\nQuestion: ${question}`,
  });
  return { answer: ai.text };
}

export async function makeFlashcards({ text, count = 8 }) {
  const n = Math.min(Math.max(Number(count) || 8, 3), 15);
  const ai = await aiGenerate({
    json: true,
    cache: false,
    maxTokens: 1600,
    system: "You create study flashcards. Reply with ONLY valid JSON, no markdown.",
    prompt:
      `From the study material below, make ${n} flashcards as JSON ` +
      `{ "cards": [ { "q", "a" } ] }. Keep questions short; answers 1-2 sentences. ` +
      `Cover the most important points.\n\n"""${text.slice(0, MAX_DOC)}"""`,
  });
  const cards = Array.isArray(ai.data?.cards)
    ? ai.data.cards.filter((c) => c && c.q && c.a).slice(0, 15)
    : [];
  return { cards };
}