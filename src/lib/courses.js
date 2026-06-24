import { searchYouTube } from "@/lib/youtube";
import { aiGenerate } from "@/lib/ai-service";
import { cacheKey, getCached, setCached } from "@/lib/cache";

const YT_TTL = 60 * 60 * 24 * 7; // 7 days

export const LANG_WORD = {
  en: "",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  ml: "Malayalam",
  kn: "Kannada",
  bn: "Bengali",
  mr: "Marathi",
  gu: "Gujarati",
};

export function normalizeLang(lang) {
  const code = (lang || "en").toLowerCase();
  return LANG_WORD[code] !== undefined ? code : "en";
}

/** Curated directory of trusted FREE learning platforms (real, verified URLs). */
export const PLATFORMS = [
  {
    name: "freeCodeCamp",
    url: "https://www.freecodecamp.org/",
    description: "Free, hands-on coding courses with free certifications.",
    tags: ["Coding", "Web", "Data"],
    certificate: true,
  },
  {
    name: "NPTEL",
    url: "https://nptel.ac.in/",
    description:
      "Free courses from India's IITs and IISc; optional paid certificate exam.",
    tags: ["Engineering", "Science", "India"],
    certificate: true,
  },
  {
    name: "Khan Academy",
    url: "https://www.khanacademy.org/",
    description: "Free lessons in math, science and more — great for basics.",
    tags: ["Math", "Science", "Basics"],
    certificate: false,
  },
  {
    name: "Coursera (Financial Aid)",
    url: "https://www.coursera.org/",
    description:
      "Audit many courses free; apply for financial aid to earn certificates.",
    tags: ["University", "Certificates"],
    certificate: true,
  },
  {
    name: "edX",
    url: "https://www.edx.org/",
    description: "Audit university courses from MIT, Harvard and more for free.",
    tags: ["University"],
    certificate: true,
  },
  {
    name: "MIT OpenCourseWare",
    url: "https://ocw.mit.edu/",
    description: "Free MIT course materials, lecture notes and assignments.",
    tags: ["University", "Advanced"],
    certificate: false,
  },
  {
    name: "CS50 (Harvard)",
    url: "https://cs50.harvard.edu/",
    description: "Harvard's famous free introduction to computer science.",
    tags: ["Coding", "Beginner"],
    certificate: true,
  },
  {
    name: "Google Digital Garage",
    url: "https://learndigital.withgoogle.com/digitalgarage",
    description:
      "Free courses and certificates in digital marketing and career skills.",
    tags: ["Marketing", "Career"],
    certificate: true,
  },
  {
    name: "HubSpot Academy",
    url: "https://academy.hubspot.com/",
    description: "Free certifications in marketing, sales and content.",
    tags: ["Marketing", "Sales"],
    certificate: true,
  },
  {
    name: "Class Central",
    url: "https://www.classcentral.com/",
    description: "A search engine to find free online courses from everywhere.",
    tags: ["Directory"],
    certificate: false,
  },
];

const PLATFORM_BY_NAME = Object.fromEntries(
  PLATFORMS.map((p) => [p.name.toLowerCase(), p])
);

async function getVideos(topic, lang) {
  const code = normalizeLang(lang);
  const key = cacheKey("yt", { topic: topic.toLowerCase(), lang: code });
  try {
    const hit = await getCached(key);
    if (hit) return hit;
  } catch {}

  const word = LANG_WORD[code];
  const query = `${topic} full course tutorial for beginners${
    word ? " in " + word : ""
  }`;
  const videos = await searchYouTube({
    query,
    maxResults: 9,
    relevanceLanguage: code,
  });

  try {
    await setCached(key, videos, { ttlSeconds: YT_TTL, provider: "youtube" });
  } catch {}
  return videos;
}

// Videos only — used when the user switches the language.
export async function getVideosForTopic({ topic, lang }) {
  try {
    const videos = await getVideos(topic, lang);
    return { videos, error: null };
  } catch (e) {
    return { videos: [], error: e.message };
  }
}

async function getRoadmap(topic) {
  const ai = await aiGenerate({
    json: true,
    cache: true,
    namespace: "roadmap",
    system:
      "You are an encouraging learning coach for students. Reply with ONLY valid JSON, no markdown.",
    prompt:
      `A student wants to learn "${topic}" for free. Return JSON with: ` +
      `overview (1-2 simple sentences on what it is and why it's worth learning), ` +
      `roadmap (array of 4-6 steps, each { title, detail } where detail is ONE short sentence on what to do).`,
    maxTokens: 800,
  });
  const d = ai.data || {};
  return {
    overview: typeof d.overview === "string" ? d.overview : "",
    roadmap: Array.isArray(d.roadmap) ? d.roadmap.slice(0, 8) : [],
  };
}

// AI picks the best platforms FOR THIS TOPIC from our real list, with a reason.
// Grounded: only names from our list are used, so links are always real.
async function getPlatformPicks(topic) {
  try {
    const names = PLATFORMS.map((p) => p.name);
    const ai = await aiGenerate({
      json: true,
      cache: true,
      namespace: "platforms",
      system:
        "You help students find FREE learning resources. Reply with ONLY valid JSON, no markdown.",
      prompt:
        `Here is a list of free learning platforms: ${JSON.stringify(names)}. ` +
        `Pick the 4-6 BEST ones for learning "${topic}" for free, best first. ` +
        `Return JSON: { "picks": [ { "name", "reason" } ] } where "name" is copied ` +
        `EXACTLY from the list and "reason" is ONE short sentence on why it helps ` +
        `with "${topic}". Use only names from the list.`,
      maxTokens: 600,
    });

    const picks = Array.isArray(ai.data?.picks) ? ai.data.picks : [];
    const out = [];
    for (const pick of picks) {
      const base = PLATFORM_BY_NAME[String(pick?.name || "").toLowerCase()];
      if (base && !out.find((o) => o.name === base.name)) {
        out.push({
          ...base,
          reason: typeof pick.reason === "string" ? pick.reason : "",
        });
      }
    }
    if (out.length >= 3) return { platforms: out, personalized: true };
  } catch {}

  // Fallback: the full static list, no per-topic reasons.
  return { platforms: PLATFORMS, personalized: false };
}

export async function getLearnInfo({ topic, lang }) {
  const code = normalizeLang(lang);
  const [videosResult, roadmap, platformPicks] = await Promise.all([
    getVideosForTopic({ topic, lang: code }),
    getRoadmap(topic).catch(() => ({ overview: "", roadmap: [] })),
    getPlatformPicks(topic).catch(() => ({
      platforms: PLATFORMS,
      personalized: false,
    })),
  ]);

  return {
    topic,
    lang: code,
    overview: roadmap.overview,
    roadmap: roadmap.roadmap,
    videos: videosResult.videos,
    videosError: videosResult.error,
    platforms: platformPicks.platforms,
    platformsPersonalized: platformPicks.personalized,
  };
}