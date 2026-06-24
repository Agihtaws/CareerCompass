"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Loader2,
  Sparkles,
  MapPin,
  Building2,
  ExternalLink,
  Lightbulb,
  Briefcase,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { isCareerSaved, toggleCareer, slugify } from "@/lib/saved";

const POPULAR = [
  "Data Analyst",
  "Graphic Designer",
  "Web Developer",
  "Accountant",
  "Digital Marketer",
  "Nurse",
];

const DEFAULT_FILTERS = { sort: "relevant", type: "any", days: "any", remote: false };

function formatSalary(min, max) {
  if (!min && !max) return null;
  const fmt = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  return fmt(min || max);
}

function Chip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
      {children}
    </span>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="hidden sm:inline">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CareersExplorer() {
  const [query, setQuery] = useState("");
  const [where, setWhere] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [data, setData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [jobsCount, setJobsCount] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [careerSaved, setCareerSaved] = useState(false);

  // Keep the save button in sync with whatever role is currently shown.
  useEffect(() => {
    if (data?.job) setCareerSaved(isCareerSaved(slugify(data.job)));
  }, [data?.job]);

  function onToggleCareer() {
    if (!data?.job) return;
    const nowSaved = toggleCareer({ id: slugify(data.job), title: data.job });
    setCareerSaved(nowSaved);
  }

  // If we arrive from "My Stuff" with ?q=role, run that search automatically.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) run(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function filterParams(f = filters) {
    const p = new URLSearchParams();
    if (f.sort && f.sort !== "relevant") p.set("sort", f.sort);
    if (f.type && f.type !== "any") p.set("type", f.type);
    if (f.days && f.days !== "any") p.set("days", f.days);
    if (f.remote) p.set("remote", "1");
    return p;
  }

  // Full search (skills + first page of jobs)
  async function run(jobTitle, f = filters) {
    const q = (jobTitle ?? query).trim();
    if (!q) return;
    setQuery(q);
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const params = filterParams(f);
      params.set("q", q);
      if (where.trim()) params.set("where", where.trim());
      const res = await fetch(`/api/careers?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong.");
      setData(json);
      setJobs(json.jobs || []);
      setJobsCount(json.jobsCount || 0);
      setPage(json.page || 1);
    } catch (e) {
      setError(e.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  // Re-fetch just the jobs (filter change) without redoing skills
  async function refreshJobs(f) {
    if (!data) return;
    setLoadingMore(true);
    try {
      const params = filterParams(f);
      params.set("q", data.job);
      params.set("mode", "jobs");
      params.set("page", "1");
      if (where.trim()) params.set("where", where.trim());
      const res = await fetch(`/api/careers?${params.toString()}`);
      const json = await res.json();
      if (res.ok) {
        setJobs(json.jobs || []);
        setJobsCount(json.jobsCount || 0);
        setPage(1);
      }
    } finally {
      setLoadingMore(false);
    }
  }

  async function loadMore() {
    if (!data) return;
    const next = page + 1;
    setLoadingMore(true);
    try {
      const params = filterParams();
      params.set("q", data.job);
      params.set("mode", "jobs");
      params.set("page", String(next));
      if (where.trim()) params.set("where", where.trim());
      const res = await fetch(`/api/careers?${params.toString()}`);
      const json = await res.json();
      if (res.ok) {
        setJobs((prev) => [...prev, ...(json.jobs || [])]);
        setPage(next);
      }
    } finally {
      setLoadingMore(false);
    }
  }

  function changeFilter(key, value) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    if (data) refreshJobs(next);
  }

  function onSubmit(e) {
    e.preventDefault();
    run();
  }

  const hasMore = jobs.length > 0 && jobs.length < jobsCount;

  return (
    <div>
      {/* Search */}
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a job, e.g. data analyst"
              className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <input
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            placeholder="City (optional)"
            className="rounded-lg border border-border bg-card px-3 py-2.5 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-44"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Search
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {POPULAR.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => run(p)}
              className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {p}
            </button>
          ))}
        </div>
      </form>

      {/* States */}
      <div className="mt-8">
        {!searched && (
          <EmptyState
            icon={Briefcase}
            title="Start by searching a job"
            description="Type a role or tap one above to see the skills it needs and real openings hiring now."
          />
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Gathering skills and live jobs…</span>
          </div>
        )}

        {!loading && error && (
          <EmptyState icon={Briefcase} title="Couldn't load that" description={error} />
        )}

        {!loading && data && (
          <div className="space-y-8">
            {/* Overview */}
            <section>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-display text-2xl font-bold capitalize">{data.job}</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                  {data.skillsSource === "onet" ? "Skills from O*NET" : "Skills: AI estimate"}
                </span>
                <button
                  type="button"
                  onClick={onToggleCareer}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    careerSaved
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {careerSaved ? (
                    <BookmarkCheck className="h-3.5 w-3.5" />
                  ) : (
                    <Bookmark className="h-3.5 w-3.5" />
                  )}
                  {careerSaved ? "Saved" : "Save"}
                </button>
              </div>
              {data.overview && (
                <p className="mt-3 max-w-2xl text-muted-foreground">{data.overview}</p>
              )}
            </section>

            {/* Guidance */}
            {data.guidance && (
              <section className="rounded-2xl border border-border bg-secondary/40 p-6">
                <div className="flex items-center gap-2 text-primary">
                  <Lightbulb className="h-5 w-5" />
                  <h3 className="font-display text-lg font-semibold">How to start</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                  {data.guidance}
                </p>
              </section>
            )}

            {/* Skills / knowledge */}
            <section className="grid gap-6 md:grid-cols-2">
              {data.skills.length > 0 && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
                    <Sparkles className="h-5 w-5 text-primary" /> Skills you'll need
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.skills.map((s) => (
                      <Chip key={s}>{s}</Chip>
                    ))}
                  </div>
                </div>
              )}
              {data.knowledge.length > 0 && (
                <div>
                  <h3 className="mb-3 font-display text-lg font-semibold">Areas to know</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.knowledge.map((s) => (
                      <Chip key={s}>{s}</Chip>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {data.tasks.length > 0 && (
              <section>
                <h3 className="mb-3 font-display text-lg font-semibold">
                  What you'd do day to day
                </h3>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {data.tasks.map((t) => (
                    <li key={t} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Jobs */}
            <section>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="font-display text-lg font-semibold">
                  Live openings{" "}
                  {jobsCount > 0 && (
                    <span className="text-muted-foreground">
                      ({jobsCount.toLocaleString("en-IN")} found)
                    </span>
                  )}
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Select
                    label="Sort"
                    value={filters.sort}
                    onChange={(v) => changeFilter("sort", v)}
                    options={[
                      { value: "relevant", label: "Most relevant" },
                      { value: "newest", label: "Newest" },
                      { value: "salary", label: "Top salary" },
                    ]}
                  />
                  <Select
                    label="Type"
                    value={filters.type}
                    onChange={(v) => changeFilter("type", v)}
                    options={[
                      { value: "any", label: "Any type" },
                      { value: "full", label: "Full-time" },
                      { value: "part", label: "Part-time" },
                    ]}
                  />
                  <Select
                    label="Posted"
                    value={filters.days}
                    onChange={(v) => changeFilter("days", v)}
                    options={[
                      { value: "any", label: "Any time" },
                      { value: "7", label: "Last 7 days" },
                      { value: "30", label: "Last 30 days" },
                    ]}
                  />
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={filters.remote}
                      onChange={(e) => changeFilter("remote", e.target.checked)}
                      className="h-4 w-4 rounded border-border accent-primary"
                    />
                    Remote
                  </label>
                </div>
              </div>

              {data.jobsError && (
                <p className="mb-4 rounded-lg border border-dashed border-border bg-card/50 px-4 py-3 text-sm text-muted-foreground">
                  Couldn't load live jobs right now. The skills above are still good to go.
                </p>
              )}

              {jobs.length === 0 && !data.jobsError ? (
                <EmptyState
                  icon={Briefcase}
                  title="No openings found"
                  description="Try a broader job title, a different city, or clear the filters."
                />
              ) : (
                <>
                  <ul className="space-y-3">
                    {jobs.map((job) => {
                      const salary = formatSalary(job.salaryMin, job.salaryMax);
                      return (
                        <li key={job.id}>
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <h4 className="font-semibold group-hover:text-primary">
                                {job.title}
                              </h4>
                              <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                              {job.company && (
                                <span className="inline-flex items-center gap-1">
                                  <Building2 className="h-4 w-4" /> {job.company}
                                </span>
                              )}
                              {job.location && (
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="h-4 w-4" /> {job.location}
                                </span>
                              )}
                              {job.contractTime && (
                                <span className="capitalize">
                                  {job.contractTime.replace("_", "-")}
                                </span>
                              )}
                            </div>
                            {salary && (
                              <p className="mt-2 text-sm font-medium text-primary">
                                {salary}
                                {job.salaryPredicted ? " (estimated)" : ""}
                              </p>
                            )}
                          </a>
                        </li>
                      );
                    })}
                  </ul>

                  {hasMore && (
                    <div className="mt-6 flex justify-center">
                      <button
                        type="button"
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-60"
                      >
                        {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                        Load more jobs
                      </button>
                    </div>
                  )}
                  <p className="mt-4 text-center text-xs text-muted-foreground">
                    Showing {jobs.length} of {jobsCount.toLocaleString("en-IN")}
                  </p>
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}