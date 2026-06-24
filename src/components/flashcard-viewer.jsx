"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";

export function FlashcardViewer({ title, cards, onClose }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = cards[idx];

  function go(d) {
    setFlipped(false);
    setIdx((i) => (i + d + cards.length) % cards.length);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-background p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display font-semibold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-2 text-sm text-muted-foreground">
          Card {idx + 1} of {cards.length}
        </p>

        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className="block h-56 w-full [perspective:1200px]"
          aria-label="Flip card"
        >
          <div
            className={`relative h-full w-full rounded-2xl transition-transform duration-500 [transform-style:preserve-3d] ${
              flipped ? "[transform:rotateY(180deg)]" : ""
            }`}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 text-center [backface-visibility:hidden]">
              <span className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
                Question
              </span>
              <p className="text-lg font-medium">{card.q}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <RotateCw className="h-3.5 w-3.5" /> Tap to flip
              </span>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-primary/30 bg-secondary/50 p-6 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <span className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
                Answer
              </span>
              <p className="text-base leading-relaxed text-foreground/90">{card.a}</p>
            </div>
          </div>
        </button>

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => go(-1)}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:bg-muted"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}