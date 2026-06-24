import { getOnetSkills } from "@/lib/onet";
import { searchJobs } from "@/lib/adzuna";
import { aiGenerate } from "@/lib/ai-service";
import { cacheKey, getCached, setCached } from "@/lib/cache";

const SKILLS_TTL = 60 * 60 * 24 * 30; // 30 days

async function getSkills(job) {
  const key = cacheKey("skills", { job: job.toLowerCase() });

  try {
    const hit = await getCached(key);
    if (hit) return hit;
  } catch {}

  let result = null;

  // ── O*NET ──────────────────────────────────────────────────────────────────
  try {
    const onet = await getOnetSkills(job);
    if (onet) result = { source: "onet", ...onet };
  } catch (e) {
    console.error(`[careers] O*NET failed for "${job}": ${e.message}`);
  }

  // ── AI fallback ────────────────────────────────────────────────────────────
  if (!result) {
    try {
      const ai = await aiGenerate({
        json: true,
        cache: false,
        system:
          "You are a friendly careers advisor for students. Reply with ONLY valid JSON, no markdown.",
        prompt:
          `For the job "${job}", return JSON with these keys: ` +
          `overview (1-2 plain sentences a 16-year-old understands), ` +
          `skills (array of 6-10 short skill names), ` +
          `knowledge (array of 4-8 subject areas), ` +
          `tasks (array of 5-8 short day-to-day tasks).`,
        maxTokens: 800,
      });
      const d = ai.data || {};
      result = {
        source: "ai",
        title: job,
        overview: typeof d.overview === "string" ? d.overview : "",
        skills: Array.isArray(d.skills) ? d.skills.slice(0, 12) : [],
        knowledge: Array.isArray(d.knowledge) ? d.knowledge.slice(0, 10) : [],
        tasks: Array.isArray(d.tasks) ? d.tasks.slice(0, 10) : [],
      };
    } catch (e) {
      console.error(`[careers] AI fallback failed for "${job}": ${e.message}`);
      result = { source: "ai", title: job, overview: "", skills: [], knowledge: [], tasks: [] };
    }
  }

  // ── Cache ──────────────────────────────────────────────────────────────────
  try {
    await setCached(key, result, { ttlSeconds: SKILLS_TTL, provider: result.source });
  } catch {}

  return result;
}

async function getGuidance(job, skills) {
  try {
    const ai = await aiGenerate({
      cache: true,
      namespace: "guidance-v2",
      system:
        "You are an encouraging careers mentor for students. Be warm, concrete, and brief.",
      prompt:
        `A student wants to become a "${job}". In 3-4 short sentences, explain how to START right now: ` +
        `the first skill to learn and a small first project they could build. ` +
        `Top skills: ${(skills || []).slice(0, 6).join(", ")}.`,
      maxTokens: 400,
    });
    return ai.text;
  } catch {
    return null;
  }
}

export async function getJobs({ job, where, country, page = 1, jobFilters = {} }) {
  try {
    const r = await searchJobs({ what: job, where, country, page, ...jobFilters });
    return { jobs: r.jobs, count: r.count, page: r.page, perPage: r.perPage, error: null };
  } catch (e) {
    return { jobs: [], count: 0, page, perPage: 10, error: e.message };
  }
}

export async function getCareerInfo({ job, where, country, page = 1, jobFilters = {} }) {
  const skills = await getSkills(job);

  const [jobsResult, guidance] = await Promise.all([
    getJobs({ job, where, country, page, jobFilters }),
    getGuidance(job, skills.skills),
  ]);

  return {
    job,
    where: where || null,
    skillsSource: skills.source,
    overview: skills.overview || "",
    skills: skills.skills || [],
    knowledge: skills.knowledge || [],
    tasks: skills.tasks || [],
    guidance: guidance || null,
    jobsCount: jobsResult.count || 0,
    jobs: jobsResult.jobs || [],
    page: jobsResult.page || 1,
    perPage: jobsResult.perPage || 10,
    jobsError: jobsResult.error || null,
  };
}