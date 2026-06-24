"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Layers,
  PlayCircle,
  Compass,
  Trash2,
  ExternalLink,
  BookOpen,
  Bookmark,
} from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { FlashcardViewer } from "@/components/flashcard-viewer";
import {
  getSavedResume,
  removeSavedResume,
  getFlashcardSets,
  removeFlashcardSet,
  getSavedVideos,
  removeVideo,
  getSavedCareers,
  removeCareer,
  onSavedChange,
} from "@/lib/saved";

function SectionTitle({ icon: Icon, children, count }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon className="h-5 w-5 text-primary" />
      <h2 className="font-display text-lg font-semibold">{children}</h2>
      {count != null && (
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
          {count}
        </span>
      )}
    </div>
  );
}

export function MyStuff() {
  const [resume, setResume] = useState(null);
  const [sets, setSets] = useState([]);
  const [videos, setVideos] = useState([]);
  const [careers, setCareers] = useState([]);
  const [viewer, setViewer] = useState(null);

  function refresh() {
    setResume(getSavedResume());
    setSets(getFlashcardSets());
    setVideos(getSavedVideos());
    setCareers(getSavedCareers());
  }
  useEffect(() => {
    refresh();
    return onSavedChange(refresh);
  }, []);

  const empty =
    !resume && sets.length === 0 && videos.length === 0 && careers.length === 0;

  if (empty) {
    return (
      <EmptyState
        icon={Bookmark}
        title="Nothing saved yet"
        description="Build a resume, save flashcard sets, and bookmark courses and careers — they'll all gather here."
      />
    );
  }

  return (
    <div className="space-y-10">
      {/* Resume */}
      {resume && (
        <section>
          <SectionTitle icon={FileText}>My resume</SectionTitle>
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div className="min-w-0">
              <p className="truncate font-medium">
                {resume.data?.contact?.name?.trim() || "My resume"}
              </p>
              <p className="text-sm capitalize text-muted-foreground">
                {resume.template || "modern"} template
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href="/resume"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
              >
                <BookOpen className="h-4 w-4" /> Open
              </Link>
              <button
                type="button"
                onClick={removeSavedResume}
                aria-label="Delete saved resume"
                className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-muted"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Flashcards */}
      {sets.length > 0 && (
        <section>
          <SectionTitle icon={Layers} count={sets.length}>
            Flashcard sets
          </SectionTitle>
          <ul className="grid gap-3 sm:grid-cols-2">
            {sets.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{s.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {s.cards?.length || 0} cards
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewer({ title: s.title, cards: s.cards })}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    Review
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFlashcardSet(s.id)}
                    aria-label="Delete set"
                    className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-muted"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Saved courses (videos) */}
      {videos.length > 0 && (
        <section>
          <SectionTitle icon={PlayCircle} count={videos.length}>
            Saved courses
          </SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <div
                key={v.id}
                className="group relative overflow-hidden rounded-xl border border-border bg-card"
              >
                <a href={v.url} target="_blank" rel="noopener noreferrer" className="block">
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
                  <div className="p-3">
                    <h4 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">
                      {v.title}
                    </h4>
                    <p className="mt-1 text-xs text-muted-foreground">{v.channel}</p>
                  </div>
                </a>
                <button
                  type="button"
                  onClick={() => removeVideo(v.id)}
                  aria-label="Remove course"
                  className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Saved careers */}
      {careers.length > 0 && (
        <section>
          <SectionTitle icon={Compass} count={careers.length}>
            Saved careers
          </SectionTitle>
          <ul className="flex flex-wrap gap-2">
            {careers.map((c) => (
              <li
                key={c.id}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-4 pr-1.5"
              >
                <Link href={`/careers?q=${encodeURIComponent(c.title)}`} className="text-sm font-medium capitalize hover:text-primary">
                  {c.title}
                </Link>
                <button
                  type="button"
                  onClick={() => removeCareer(c.id)}
                  aria-label="Remove career"
                  className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {viewer && (
        <FlashcardViewer
          title={viewer.title}
          cards={viewer.cards}
          onClose={() => setViewer(null)}
        />
      )}
    </div>
  );
}