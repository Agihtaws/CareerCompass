"use client";

import { useRef, useState } from "react";
import {
  FileUp,
  Image as ImageIcon,
  Loader2,
  FileText,
  Sparkles,
  Layers,
  Send,
} from "lucide-react";
import { Markdown } from "@/components/markdown";

export function AskDocument({ docText, setDocText, goToFlashcards }) {
  const [busy, setBusy] = useState(null); // "pdf" | "ocr" | "summary" | "ask"
  const [ocrProgress, setOcrProgress] = useState(0);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const pdfRef = useRef(null);
  const imgRef = useRef(null);

  async function onPdf(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setBusy("pdf");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/ask/pdf", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Couldn't read that PDF.");
      setDocText(json.text);
      setSummary("");
      setAnswer("");
    } catch (e2) {
      setError(e2.message);
    } finally {
      setBusy(null);
    }
  }

  async function onImage(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setBusy("ocr");
    setOcrProgress(0);
    try {
      const Tesseract = (await import("tesseract.js")).default;
      const { data } = await Tesseract.recognize(file, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setOcrProgress(Math.round((m.progress || 0) * 100));
          }
        },
      });
      const text = (data.text || "").trim();
      if (!text) throw new Error("No readable text found in that image.");
      setDocText(text);
      setSummary("");
      setAnswer("");
    } catch (e2) {
      setError(e2.message || "Couldn't read that image.");
    } finally {
      setBusy(null);
    }
  }

  async function summarize() {
    if (!docText.trim()) return;
    setBusy("summary");
    setSummary("");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "summarize", text: docText }),
      });
      const json = await res.json();
      if (res.ok) setSummary(json.summary || "");
    } finally {
      setBusy(null);
    }
  }

  async function ask() {
    if (!docText.trim() || !question.trim()) return;
    setBusy("ask");
    setAnswer("");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "ask", text: docText, question }),
      });
      const json = await res.json();
      if (res.ok) setAnswer(json.answer || "");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload buttons */}
      <div className="flex flex-wrap gap-3">
        <input ref={pdfRef} type="file" accept="application/pdf" onChange={onPdf} className="hidden" />
        <input ref={imgRef} type="file" accept="image/*" onChange={onImage} className="hidden" />
        <button
          type="button"
          onClick={() => pdfRef.current?.click()}
          disabled={!!busy}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-60"
        >
          {busy === "pdf" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
          Upload a PDF
        </button>
        <button
          type="button"
          onClick={() => imgRef.current?.click()}
          disabled={!!busy}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-60"
        >
          {busy === "ocr" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
          Upload an image
        </button>
      </div>

      {busy === "ocr" && (
        <p className="text-sm text-muted-foreground">
          Reading the image… {ocrProgress}% (the first time downloads a small
          language file, so give it a moment.)
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Extracted text */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium">
          <FileText className="h-4 w-4 text-muted-foreground" /> Document text
          {docText && (
            <span className="font-normal text-muted-foreground">
              ({docText.length.toLocaleString()} characters)
            </span>
          )}
        </label>
        <textarea
          value={docText}
          onChange={(e) => setDocText(e.target.value)}
          placeholder="Upload a PDF or image above — or paste any text here — then summarize it, ask questions, or make flashcards."
          className="min-h-40 w-full rounded-xl border border-border bg-card p-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={summarize}
          disabled={!!busy || !docText.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-60"
        >
          {busy === "summary" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Summarize
        </button>
        <button
          type="button"
          onClick={goToFlashcards}
          disabled={!docText.trim()}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-60"
        >
          <Layers className="h-4 w-4" /> Make flashcards from this
        </button>
      </div>

      {summary && (
        <div className="rounded-xl border border-border bg-secondary/40 p-4">
          <h4 className="mb-2 font-display text-sm font-semibold">Summary</h4>
          <Markdown>{summary}</Markdown>
        </div>
      )}

      {/* Ask about the document */}
      <div>
        <label className="mb-2 block text-sm font-medium">Ask about this document</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask()}
            placeholder="e.g. What are the main points?"
            className="flex-1 rounded-lg border border-border bg-card px-3 py-2.5 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="button"
            onClick={ask}
            disabled={!!busy || !docText.trim() || !question.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-60"
          >
            {busy === "ask" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Ask
          </button>
        </div>
        {answer && (
          <div className="mt-3 rounded-xl border border-border bg-card p-4">
            <Markdown>{answer}</Markdown>
          </div>
        )}
      </div>
    </div>
  );
}