"use client";

import { useState } from "react";
import { Search, Loader2, ChevronDown, Volume2, ListChecks } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { speak } from "@/components/use-speech-recognition";

const ROLES = [
  "Teacher",
  "Software Developer",
  "Sales Associate",
  "Nurse",
  "Graphic Designer",
  "Receptionist",
];

export function QuestionBank() {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState({});

  async function run(r) {
    const q = (r ?? role).trim();
    if (!q) return;
    setRole(q);
    setLoading(true);
    setError(null);
    setData(null);
    setOpen({});
    try {
      const res = await fetch(`/api/interview?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong.");
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
        className="space-y-3"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Which role are you interviewing for? e.g. teacher"
              className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Get questions
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => run(r)}
              className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {r}
            </button>
          ))}
        </div>
      </form>

      <div className="mt-8">
        {!data && !loading && !error && (
          <EmptyState
            icon={ListChecks}
            title="Pick a role to prepare"
            description="Get the most common interview questions, each with a few ways to answer well."
          />
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Preparing your questions…</span>
          </div>
        )}

        {!loading && error && (
          <EmptyState icon={ListChecks} title="Couldn't load that" description={error} />
        )}

        {!loading && data?.questions?.length > 0 && (
          <ul className="space-y-3">
            {data.questions.map((q, i) => {
              const isOpen = open[i];
              return (
                <li
                  key={i}
                  className="overflow-hidden rounded-xl border border-border bg-card"
                >
                  <div className="flex items-center gap-2 p-4">
                    <button
                      type="button"
                      onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))}
                      className="flex flex-1 items-center justify-between gap-3 text-left"
                    >
                      <span className="font-medium">{q.question}</span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <button
                      type="button"
                      aria-label="Hear the question"
                      onClick={() => speak(q.question)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>
                  {isOpen && (
                    <div className="space-y-3 border-t border-border p-4">
                      {(q.approaches || []).map((a, ai2) => (
                        <div key={ai2}>
                          <span className="inline-block rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-primary">
                            {a.label}
                          </span>
                          <p className="mt-1.5 text-sm text-muted-foreground">
                            {a.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}