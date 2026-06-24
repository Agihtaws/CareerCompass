"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Loader2,
  GraduationCap,
  PlayCircle,
  ExternalLink,
  Map,
  Award,
  Languages,
  Sparkles,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { getSavedVideos, toggleVideo } from "@/lib/saved";

const POPULAR = [
  "Python",
  "Excel",
  "Graphic Design",
  "Public Speaking",
  "Web Development",
  "Digital Marketing",
];

const LANGS = [
  { code: "en", label: "English" },
  { code: "ta", label: "Tamil" },
  { code: "hi", label: "Hindi" },
  { code: "te", label: "Telugu" },
  { code: "ml", label: "Malayalam" },
  { code: "kn", label: "Kannada" },
  { code: "bn", label: "Bengali" },
  { code: "mr", label: "Marathi" },
  { code: "gu", label: "Gujarati" },
];

function compactViews(n) {
  if (n == null) return null;
  return new Intl.NumberFormat("en", { notation: "compact" }).format(n) + " views";
}

export function LearnExplorer() {
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState("en");
  const [loading, setLoading] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [savedIds, setSavedIds] = useState(() => new Set());

  useEffect(() => {
    setSavedIds(new Set(getSavedVideos().map((v) => v.id)));
  }, []);

  function onToggleSave(v) {
    const nowSaved = toggleVideo(v);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (nowSaved) next.add(v.id);
      else next.delete(v.id);
      return next;
    });
  }

  async function run(topic, useLang = lang) {
    const q = (topic ?? query).trim();
    if (!q) return;
    setQuery(q);
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const res = await fetch(
        `/api/learn?q=${encodeURIComponent(q)}&lang=${useLang}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong.");
      setData(json);
    } catch (e) {
      setError(e.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  // Re-fetch only the videos when the language changes.
  async function changeLanguage(newLang) {
    setLang(newLang);
    if (!data) return;
    setLoadingVideos(true);
    try {
      const res = await fetch(
        `/api/learn?q=${encodeURIComponent(
          data.topic
        )}&lang=${newLang}&mode=videos`
      );
      const json = await res.json();
      if (res.ok) {
        setData((d) => ({
          ...d,
          videos: json.videos,
          videosError: json.videosError,
          lang: newLang,
        }));
      }
    } finally {
      setLoadingVideos(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    run();
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you want to learn? e.g. python"
              className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
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
            Find courses
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

      <div className="mt-8">
        {!searched && (
          <EmptyState
            icon={GraduationCap}
            title="Pick something to learn"
            description="Search a skill or tap one above to get a free study plan, real video courses, and trusted free platforms."
          />
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Building your free learning plan…</span>
          </div>
        )}

        {!loading && error && (
          <EmptyState icon={GraduationCap} title="Couldn't load that" description={error} />
        )}

        {!loading && data && (
          <div className="space-y-10">
            {/* Overview */}
            <section>
              <h2 className="font-display text-2xl font-bold capitalize">{data.topic}</h2>
              {data.overview && (
                <p className="mt-3 max-w-2xl text-muted-foreground">{data.overview}</p>
              )}
            </section>

            {/* Roadmap */}
            {data.roadmap?.length > 0 && (
              <section>
                <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
                  <Map className="h-5 w-5 text-primary" /> Your free study plan
                </h3>
                <ol className="space-y-3">
                  {data.roadmap.map((step, i) => (
                    <li
                      key={i}
                      className="flex gap-4 rounded-xl border border-border bg-card p-4"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary font-semibold text-primary">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-semibold">{step.title}</p>
                        {step.detail && (
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {step.detail}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Videos */}
            <section>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                  <PlayCircle className="h-5 w-5 text-primary" /> Free video courses
                </h3>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Languages className="h-4 w-4" />
                  <span className="hidden sm:inline">Language</span>
                  <select
                    value={lang}
                    onChange={(e) => changeLanguage(e.target.value)}
                    disabled={loadingVideos}
                    className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                  >
                    {LANGS.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {data.videosError && (
                <p className="mb-4 rounded-lg border border-dashed border-border bg-card/50 px-4 py-3 text-sm text-muted-foreground">
                  Couldn't load videos right now (the YouTube key may be missing or
                  out of quota). Your study plan and platforms below still work.
                </p>
              )}

              {loadingVideos ? (
                <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Finding videos…</span>
                </div>
              ) : data.videos?.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {data.videos.map((v) => (
                    <div
                      key={v.id}
                      className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-md"
                    >
                      <a
                        href={v.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <div className="relative aspect-video bg-muted">
                          {v.thumbnail && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={v.thumbnail}
                              alt={v.title}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          )}
                          {v.duration && (
                            <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
                              {v.duration}
                            </span>
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className="line-clamp-2 font-semibold leading-snug group-hover:text-primary">
                            {v.title}
                          </h4>
                          <p className="mt-1 text-sm text-muted-foreground">{v.channel}</p>
                          {compactViews(v.views) && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {compactViews(v.views)}
                            </p>
                          )}
                        </div>
                      </a>
                      <button
                        type="button"
                        onClick={() => onToggleSave(v)}
                        aria-label={savedIds.has(v.id) ? "Remove from saved" : "Save course"}
                        className={`absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                          savedIds.has(v.id)
                            ? "bg-primary text-primary-foreground"
                            : "bg-black/60 text-white hover:bg-black/80"
                        }`}
                      >
                        {savedIds.has(v.id) ? (
                          <BookmarkCheck className="h-4 w-4" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                !data.videosError && (
                  <EmptyState
                    icon={PlayCircle}
                    title="No videos found"
                    description="Try a simpler topic name or a different language."
                  />
                )
              )}
            </section>

            {/* Trusted platforms */}
            <section>
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
                <Award className="h-5 w-5 text-primary" />{" "}
                {data.platformsPersonalized ? (
                  <span>
                    Best free places to learn{" "}
                    <span className="capitalize">{data.topic}</span>
                  </span>
                ) : (
                  "Trusted free platforms"
                )}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {data.platforms?.map((p) => (
                  <a
                    key={p.name}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-semibold group-hover:text-primary">{p.name}</h4>
                      <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                    {p.reason && (
                      <p className="mt-2 flex gap-1.5 text-sm text-foreground/80">
                        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <span>{p.reason}</span>
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.certificate && (
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-primary">
                          Free certificate
                        </span>
                      )}
                      {p.tags?.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </a>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}