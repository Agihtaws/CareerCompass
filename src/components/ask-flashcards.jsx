"use client";

import { useState } from "react";
import {
  Loader2,
  Layers,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Save,
  Check,
  RotateCw,
} from "lucide-react";

const SETS_KEY = "careercompass.flashcards.v1";
const uid = () => Math.random().toString(36).slice(2, 9);

export function AskFlashcards({ initialText = "" }) {
  const [text, setText] = useState(initialText);
  const [count, setCount] = useState(8);
  const [cards, setCards] = useState([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [saved, setSaved] = useState(false);

  async function generate() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "flashcards", text, count }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Couldn't make flashcards.");
      if (!json.cards?.length) throw new Error("No cards came back — try more text.");
      setCards(json.cards);
      setIdx(0);
      setFlipped(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function go(dir) {
    setFlipped(false);
    setIdx((i) => (i + dir + cards.length) % cards.length);
  }
  function shuffle() {
    setCards((c) => [...c].sort(() => Math.random() - 0.5));
    setIdx(0);
    setFlipped(false);
  }
  function saveSet() {
    try {
      const set = {
        id: uid(),
        title: title.trim() || "Flashcards",
        cards,
        createdAt: Date.now(),
      };
      const existing = JSON.parse(localStorage.getItem(SETS_KEY) || "[]");
      localStorage.setItem(SETS_KEY, JSON.stringify([set, ...existing].slice(0, 50)));
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch {}
  }

  const card = cards[idx];

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium">
          Paste notes, or bring text from the “Read a document” tab
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste study material here…"
          className="min-h-32 w-full rounded-xl border border-border bg-card p-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-muted-foreground">How many cards?</label>
        <select
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {[5, 8, 10, 12, 15].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={generate}
          disabled={loading || !text.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
          Generate flashcards
        </button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {card && (
        <div>
          <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
            <span>Card {idx + 1} of {cards.length}</span>
            <button type="button" onClick={shuffle} className="inline-flex items-center gap-1 hover:text-foreground">
              <Shuffle className="h-4 w-4" /> Shuffle
            </button>
          </div>

          {/* Flip card */}
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className="group block h-64 w-full [perspective:1200px]"
            aria-label="Flip card"
          >
            <div
              className={`relative h-full w-full rounded-2xl transition-transform duration-500 [transform-style:preserve-3d] ${
                flipped ? "[transform:rotateY(180deg)]" : ""
              }`}
            >
              {/* Front (question) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 text-center [backface-visibility:hidden]">
                <span className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Question</span>
                <p className="text-lg font-medium">{card.q}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <RotateCw className="h-3.5 w-3.5" /> Tap to flip
                </span>
              </div>
              {/* Back (answer) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-primary/30 bg-secondary/50 p-6 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <span className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Answer</span>
                <p className="text-base leading-relaxed text-foreground/90">{card.a}</p>
              </div>
            </div>
          </button>

          <div className="mt-4 flex items-center justify-between">
            <button type="button" onClick={() => go(-1)} className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:bg-muted">
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>

            <div className="flex items-center gap-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Name this set"
                className="w-36 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button type="button" onClick={saveSet} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-muted">
                {saved ? <Check className="h-4 w-4 text-primary" /> : <Save className="h-4 w-4" />}
                {saved ? "Saved" : "Save"}
              </button>
            </div>

            <button type="button" onClick={() => go(1)} className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:bg-muted">
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Saved sets will appear in “My Stuff”.
          </p>
        </div>
      )}
    </div>
  );
}