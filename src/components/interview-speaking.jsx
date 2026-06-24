"use client";

import { useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  Loader2,
  Volume2,
  FileUp,
  FileText,
  Bot,
  ArrowRight,
  RotateCcw,
  Heart,
  ThumbsUp,
  Lightbulb,
  Play,
} from "lucide-react";
import { useSpeechRecognition, speak } from "@/components/use-speech-recognition";
import { getSavedResume } from "@/lib/saved";

function resumeToText(saved) {
  const d = saved?.data;
  if (!d) return "";
  const parts = [];
  if (d.contact?.name) parts.push(`Name: ${d.contact.name}`);
  if (d.contact?.title) parts.push(`Title: ${d.contact.title}`);
  if (d.summary) parts.push(`Summary: ${d.summary}`);
  const asText = (v) => (Array.isArray(v) ? v.join(", ") : v || "");
  if (asText(d.skills)) parts.push(`Skills: ${asText(d.skills)}`);
  if (asText(d.languages)) parts.push(`Languages: ${asText(d.languages)}`);
  if (d.experience?.length)
    parts.push(
      "Experience:\n" +
        d.experience
          .map(
            (e) =>
              `- ${e.role} at ${e.org} (${[e.from, e.to].filter(Boolean).join(" - ")}): ${(e.bullets || []).join("; ")}`
          )
          .join("\n")
    );
  if (d.education?.length)
    parts.push(
      "Education:\n" +
        d.education
          .map((e) => `- ${e.degree}, ${e.school}${e.grade ? ` (${e.grade})` : ""}`)
          .join("\n")
    );
  if (d.projects?.length)
    parts.push("Projects:\n" + d.projects.map((p) => `- ${p.name}: ${p.detail}`).join("\n"));
  return parts.join("\n");
}

export function SpeakingRoom() {
  const [phase, setPhase] = useState("setup"); // setup | interview | scoring | done
  const [role, setRole] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [resumeLabel, setResumeLabel] = useState("");
  const [uploading, setUploading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [current, setCurrent] = useState("");
  const [feedback, setFeedback] = useState(null);

  const pdfRef = useRef(null);
  const speech = useSpeechRecognition();

  // Mirror live speech into the answer box.
  useEffect(() => {
    if (speech.listening) setCurrent(speech.transcript);
  }, [speech.transcript, speech.listening]);

  // Speak each question aloud when it appears.
  useEffect(() => {
    if (phase === "interview" && questions[idx]) speak(questions[idx]);
  }, [idx, phase, questions]);

  async function onPdf(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/ask/pdf", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Couldn't read that PDF.");
      setResumeText(json.text);
      setResumeLabel(file.name);
    } catch (e2) {
      setError(e2.message);
    } finally {
      setUploading(false);
    }
  }

  function useSavedResume() {
    const saved = getSavedResume();
    const text = resumeToText(saved);
    if (!text) {
      setError("No saved resume found — build one in the Resume tab first, or upload a PDF.");
      return;
    }
    setResumeText(text);
    setResumeLabel("My saved resume");
    setError(null);
  }

  function clearResume() {
    setResumeText("");
    setResumeLabel("");
  }

  async function start() {
    setStarting(true);
    setError(null);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "voiceset", role, resume: resumeText }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Couldn't start the interview.");
      setQuestions(json.questions || []);
      setAnswers([]);
      setIdx(0);
      setCurrent("");
      setFeedback(null);
      setPhase("interview");
    } catch (e2) {
      setError(e2.message);
    } finally {
      setStarting(false);
    }
  }

  function toggleMic() {
    if (speech.listening) speech.stop();
    else speech.start();
  }

  async function next() {
    if (speech.listening) speech.stop();
    const saved = [...answers];
    saved[idx] = current;
    setAnswers(saved);

    if (idx + 1 < questions.length) {
      setIdx(idx + 1);
      setCurrent("");
    } else {
      finish(saved);
    }
  }

  async function finish(allAnswers) {
    setPhase("scoring");
    try {
      const qa = questions.map((q, i) => ({ question: q, answer: allAnswers[i] || "" }));
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "summary", role, qa }),
      });
      const json = await res.json();
      if (res.ok) {
        setFeedback(json);
        if (json.encouragement) speak(json.encouragement);
      }
    } finally {
      setPhase("done");
    }
  }

  function restart() {
    if (speech.listening) speech.stop();
    setPhase("setup");
    setQuestions([]);
    setAnswers([]);
    setCurrent("");
    setFeedback(null);
    setIdx(0);
  }

  /* ---------------- SETUP ---------------- */
  if (phase === "setup") {
    return (
      <div className="max-w-2xl">
        <p className="mb-5 text-muted-foreground">
          A real, spoken mock interview. The interviewer asks out loud and you
          answer with your voice — general questions first, then questions about
          your resume. It's private, and you'll get kind feedback at the end.
        </p>

        <div className="space-y-5 rounded-xl border border-border bg-card p-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Role you're practising for{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Graphic Designer"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Your resume{" "}
              <span className="font-normal text-muted-foreground">
                (optional — makes questions personal)
              </span>
            </label>
            <input ref={pdfRef} type="file" accept="application/pdf" onChange={onPdf} className="hidden" />
            {resumeLabel ? (
              <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-secondary/40 px-3 py-2.5">
                <span className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-primary" /> {resumeLabel}
                </span>
                <button type="button" onClick={clearResume} className="text-xs text-muted-foreground hover:text-foreground">
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => pdfRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-60"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
                  Upload PDF
                </button>
                <button
                  type="button"
                  onClick={useSavedResume}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <FileText className="h-4 w-4" /> Use my saved resume
                </button>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="button"
            onClick={start}
            disabled={starting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-60"
          >
            {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Start the interview
          </button>
        </div>

        {!speech.supported && (
          <p className="mt-4 rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            Voice answers need Chrome or Edge. You can still do the interview by
            typing your answers.
          </p>
        )}
      </div>
    );
  }

  /* ---------------- SCORING ---------------- */
  if (phase === "scoring") {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Putting together your feedback…</span>
      </div>
    );
  }

  /* ---------------- DONE ---------------- */
  if (phase === "done" && feedback) {
    return (
      <div className="max-w-2xl space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-border bg-secondary/40 p-4">
          <Heart className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm leading-relaxed text-foreground/90">{feedback.encouragement}</p>
        </div>

        {feedback.strengths?.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-4">
            <h4 className="mb-2 flex items-center gap-2 font-display text-sm font-semibold">
              <ThumbsUp className="h-4 w-4 text-primary" /> What you did well
            </h4>
            <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/90">
              {feedback.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {feedback.improvements?.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-4">
            <h4 className="mb-2 flex items-center gap-2 font-display text-sm font-semibold">
              <Lightbulb className="h-4 w-4 text-accent" /> Gentle tips for next time
            </h4>
            <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/90">
              {feedback.improvements.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {feedback.closing && (
          <p className="text-center text-sm font-medium text-primary">{feedback.closing}</p>
        )}

        <div className="flex justify-center">
          <button
            type="button"
            onClick={restart}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            <RotateCcw className="h-4 w-4" /> Practise again
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- INTERVIEW ---------------- */
  return (
    <div className="max-w-2xl">
      <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
        <span>Question {idx + 1} of {questions.length}</span>
        <button type="button" onClick={restart} className="hover:text-foreground">End</button>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${((idx + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="mt-5 rounded-xl border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
            <Bot className="h-5 w-5" />
          </span>
          <p className="flex-1 pt-1.5 font-medium">{questions[idx]}</p>
          <button
            type="button"
            aria-label="Hear the question again"
            onClick={() => speak(questions[idx])}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
          >
            <Volume2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center gap-3">
        {speech.supported && (
          <button
            type="button"
            onClick={toggleMic}
            className={`inline-flex h-16 w-16 items-center justify-center rounded-full transition-colors ${
              speech.listening
                ? "bg-destructive text-destructive-foreground"
                : "bg-primary text-primary-foreground hover:opacity-90"
            }`}
            aria-label={speech.listening ? "Stop answering" : "Start answering"}
          >
            {speech.listening ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
          </button>
        )}
        <span className="text-sm text-muted-foreground">
          {speech.listening
            ? "Listening… tap to stop"
            : speech.supported
            ? "Tap the mic and answer out loud"
            : "Type your answer below"}
        </span>
      </div>

      <textarea
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
        placeholder="Your answer appears here…"
        className="mt-4 min-h-24 w-full rounded-xl border border-border bg-card p-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={next}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
        >
          {idx + 1 < questions.length ? "Next question" : "Finish & get feedback"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}