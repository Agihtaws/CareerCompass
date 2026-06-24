import { aiGenerate } from "@/lib/ai-service";
import { cacheKey, getCached, setCached } from "@/lib/cache";

const Q_TTL = 60 * 60 * 24 * 14; // 14 days

// Question bank for a role (cached).
export async function getQuestions(role) {
  const key = cacheKey("iq", { role: role.toLowerCase() });
  try {
    const hit = await getCached(key);
    if (hit) return hit;
  } catch {}

  const ai = await aiGenerate({
    json: true,
    cache: false,
    system:
      "You are an interview coach for students. Reply with ONLY valid JSON, no markdown.",
    prompt:
      `For a "${role}" job interview, return JSON: ` +
      `{ "questions": [ { "question", "approaches": [ { "label", "answer" } ] } ] }. ` +
      `Give 6 common questions. For each, 2-3 approaches with a SHORT label ` +
      `(e.g. Safe, Confident, Story-based) and a 1-2 sentence example answer a ` +
      `student can adapt. Keep it simple and encouraging.`,
    maxTokens: 1600,
  });

  const qs = Array.isArray(ai.data?.questions)
    ? ai.data.questions.slice(0, 8)
    : [];
  const result = { role, questions: qs };

  try {
    await setCached(key, result, { ttlSeconds: Q_TTL, provider: ai.provider });
  } catch {}
  return result;
}

// Feedback on a typed/spoken mock-interview answer.
export async function getAnswerFeedback({ role, question, answer }) {
  const ai = await aiGenerate({
    cache: false,
    system:
      "You are a kind, encouraging interview coach for students. Be warm and constructive, never harsh.",
    prompt:
      `Role: "${role || "a job"}". Question: "${question}". ` +
      `The student's answer: "${answer}". ` +
      `In 2-3 short sentences: name one thing they did well, then one concrete way ` +
      `to improve. Then on a NEW LINE write "Try: " followed by a stronger ` +
      `one-sentence version they could say.`,
    maxTokens: 350,
  });
  return { feedback: ai.text };
}

// Gentle feedback for the English speaking room.
export async function getSpeakingFeedback({ prompt, transcript }) {
  const ai = await aiGenerate({
    json: true,
    cache: false,
    system:
      "You are a warm, patient English speaking coach for students who get nervous speaking. Be very kind and encouraging. Reply with ONLY valid JSON, no markdown.",
    prompt:
      `The student practiced speaking English aloud. Prompt: "${prompt || "open topic"}". ` +
      `They said: "${transcript}". Return JSON: ` +
      `{ "encouragement": one warm sentence praising their effort, ` +
      `"fixes": array of up to 3 { "wrong", "better" } small grammar/word fixes ` +
      `(empty array if none), ` +
      `"smoother": a natural, smoother version of what they said with the same meaning, ` +
      `"tip": one short practical speaking tip }. Never be harsh.`,
    maxTokens: 600,
  });
  const d = ai.data || {};
  return {
    encouragement:
      typeof d.encouragement === "string"
        ? d.encouragement
        : "Great effort speaking up — that takes courage!",
    fixes: Array.isArray(d.fixes) ? d.fixes.slice(0, 4) : [],
    smoother: typeof d.smoother === "string" ? d.smoother : "",
    tip: typeof d.tip === "string" ? d.tip : "",
  };
}

// ---- Voice interview: tailored question list (general first, then resume-based) ----
export async function getVoiceInterviewQuestions({ role, resume }) {
  const hasResume = resume && resume.trim().length > 20;
  const ai = await aiGenerate({
    json: true,
    cache: false,
    maxTokens: 800,
    system:
      "You are a friendly interviewer. Reply with ONLY valid JSON, no markdown.",
    prompt:
      `Create a short mock interview${role ? ` for the role "${role}"` : ""}. ` +
      `Return JSON { "questions": ["...", "..."] } with 5 to 6 SHORT spoken questions, in the order to ask. ` +
      `Start with 2 general questions (e.g. "Tell me about yourself", "Why do you want this role?"). ` +
      (hasResume
        ? `Then 3-4 questions based on THIS CANDIDATE'S RESUME below — ask about their real skills, projects, and experience.\n\nResume:\n"""${resume.slice(0, 4000)}"""`
        : `Then 3 common interview questions.`),
  });
  let questions = Array.isArray(ai.data?.questions)
    ? ai.data.questions.filter((q) => typeof q === "string" && q.trim()).slice(0, 6)
    : [];
  if (!questions.length) {
    questions = [
      "Tell me about yourself.",
      "What are your biggest strengths?",
      "Why do you want this role?",
      "Tell me about something you've worked on.",
      "Where do you see yourself in a few years?",
    ];
  }
  return { questions };
}

// ---- Voice interview: warm overall feedback at the end ----
export async function getInterviewSummary({ role, qa }) {
  const transcript = (qa || [])
    .map((x, i) => `Q${i + 1}: ${x.question}\nA${i + 1}: ${x.answer || "(no answer given)"}`)
    .join("\n\n");

  const ai = await aiGenerate({
    json: true,
    cache: false,
    maxTokens: 700,
    system:
      "You are a warm, encouraging interview coach for a student who gets nervous. Reply with ONLY valid JSON, no markdown. Be kind and practical, never harsh.",
    prompt:
      `Here is a practice interview${role ? ` for "${role}"` : ""}.\n\n${transcript}\n\n` +
      `Return JSON { "encouragement": one warm sentence praising their effort, ` +
      `"strengths": array of up to 3 short specific strengths, ` +
      `"improvements": array of up to 3 short, gentle, practical tips, ` +
      `"closing": one motivating sentence }.`,
  });
  const d = ai.data || {};
  return {
    encouragement:
      typeof d.encouragement === "string"
        ? d.encouragement
        : "Well done for finishing the whole interview — that takes real courage!",
    strengths: Array.isArray(d.strengths) ? d.strengths.slice(0, 3) : [],
    improvements: Array.isArray(d.improvements) ? d.improvements.slice(0, 3) : [],
    closing:
      typeof d.closing === "string"
        ? d.closing
        : "Every practice makes the real thing easier. Keep going!",
  };
}