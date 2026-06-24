const BASE = "https://api-v2.onetcenter.org";
const API_KEY = process.env.ONET_API_KEY?.replace(/^["']|["']$/g, "");

async function onetGet(path) {
  if (!API_KEY) {
    console.error("[O*NET] ❌ ONET_API_KEY missing from env!");
    throw new Error("O*NET: no API key");
  }

  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "X-API-Key": API_KEY,
      Accept: "application/json",
      "User-Agent": "CareerCompass/1.0",
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "(unreadable)");
    console.error(`[O*NET] ❌ ${res.status} ${path} — ${body.slice(0, 200)}`);
    throw new Error(`O*NET ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

function parseSkills(data) {
  const items = data?.element ?? data?.skill ?? [];
  return [...new Set(
    items
      .filter((x) => x?.name)
      .sort((a, b) => (b?.score?.value ?? 0) - (a?.score?.value ?? 0))
      .map((x) => x.name.trim())
  )].slice(0, 10);
}

function parseKnowledge(data) {
  const items = data?.element ?? data?.knowledge ?? [];
  return [...new Set(
    items
      .filter((x) => x?.name)
      .sort((a, b) => (b?.score?.value ?? 0) - (a?.score?.value ?? 0))
      .map((x) => x.name.trim())
  )].slice(0, 8);
}

function parseTasks(data) {
  const items = data?.task ?? [];
  return [...new Set(
    items
      .filter((x) => x?.title || x?.statement)
      .sort((a, b) => (b?.importance ?? 0) - (a?.importance ?? 0))
      .map((x) => (x.title ?? x.statement).trim())
  )].slice(0, 8);
}

export async function getOnetSkills(job) {
  // 1) Search for the closest O*NET-SOC code
  let search;
  try {
    search = await onetGet(`/mnm/search?keyword=${encodeURIComponent(job)}`);
  } catch (e) {
    console.error(`[O*NET] search failed for "${job}": ${e.message}`);
    return null;
  }

  const careers = Array.isArray(search?.career) ? search.career : [];
  const occ = careers[0] ?? null;
  const code = occ?.code;

  if (!code) return null;

  // 2) Fetch full professional data from /online/ endpoints in parallel
  const [overview, skills, knowledge, tasks] = await Promise.all([
    onetGet(`/online/occupations/${code}`).catch(() => null),
    onetGet(`/online/occupations/${code}/details/skills`).catch(() => null),
    onetGet(`/online/occupations/${code}/details/knowledge`).catch(() => null),
    onetGet(`/online/occupations/${code}/details/tasks`).catch(() => null),
  ]);

  const result = {
    code,
    title: occ.title || job,
    overview: typeof overview?.description === "string" ? overview.description : "",
    skills: parseSkills(skills),
    knowledge: parseKnowledge(knowledge),
    tasks: parseTasks(tasks),
  };

  if (!result.skills.length && !result.knowledge.length) return null;
  return result;
}