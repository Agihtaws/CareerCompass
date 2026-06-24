
export async function searchJobs({
  what,
  where,
  country = process.env.ADZUNA_COUNTRY || "in",
  page = 1,
  resultsPerPage = 10,
  // filters:
  sortBy, // "date" | "salary" | "relevance"
  fullTime, // boolean
  partTime, // boolean
  maxDaysOld, // number 
  salaryMin, // number
  distance, // km, only used with `where`
  remote, // boolean 
}) {
  const id = process.env.ADZUNA_APP_ID;
  const key = process.env.ADZUNA_APP_KEY;
  if (!id || !key) throw new Error("Adzuna credentials are not set.");

  const params = new URLSearchParams({
    app_id: id,
    app_key: key,
    results_per_page: String(resultsPerPage),
    "content-type": "application/json",
  });

  
  let term = what || "";
  if (remote) term = `${term} remote`.trim();
  if (term) params.set("what", term);

  if (where) params.set("where", where);
  if (where && distance) params.set("distance", String(distance));
  if (sortBy) params.set("sort_by", sortBy);
  if (fullTime) params.set("full_time", "1");
  if (partTime) params.set("part_time", "1");
  if (maxDaysOld) params.set("max_days_old", String(maxDaysOld));
  if (salaryMin) params.set("salary_min", String(salaryMin));

  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Adzuna ${res.status}: ${t.slice(0, 150)}`);
  }

  const data = await res.json();
  const results = Array.isArray(data?.results) ? data.results : [];

  return {
    count: data?.count ?? results.length,
    page,
    perPage: resultsPerPage,
    jobs: results.map((j) => ({
      id: j.id,
      title: j.title,
      company: j.company?.display_name || "",
      location: j.location?.display_name || "",
      description: (j.description || "").replace(/\s+/g, " ").trim().slice(0, 260),
      salaryMin: j.salary_min ?? null,
      salaryMax: j.salary_max ?? null,
      salaryPredicted: j.salary_is_predicted === "1",
      contractTime: j.contract_time || null,
      category: j.category?.label || "",
      url: j.redirect_url,
      created: j.created || null,
    })),
  };
}