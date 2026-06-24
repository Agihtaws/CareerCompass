"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Bot,
  Mic,
  MicOff,
  Send,
  ArrowRight,
  RotateCcw,
  PartyPopper,
} from "lucide-react";
import { useSpeechRecognition } from "@/components/use-speech-recognition";

export function MockInterview() {
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState(null);

  const speech = useSpeechRecognition();

  // While the mic is on, mirror the live transcript into the answer box.
  useEffect(() => {
    if (speech.listening) setAnswer(speech.transcript);
  }, [speech.transcript, speech.listening]);

  async function start(e) {
    e?.preventDefault();
    if (!role.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/interview?q=${encodeURIComponent(role.trim())}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not start.");
      const qs = (json.questions || []).map((q) => q.question).filter(Boolean);
      if (!qs.length) throw new Error("No questions came back. Try another role.");
      setQuestions(qs);
      setIdx(0);
      setAnswer("");
      setFeedback("");
      setFinished(false);
      setStarted(true);
    } catch (e2) {
      setError(e2.message);
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    if (!answer.trim()) return;
    if (speech.listening) speech.stop();
    setThinking(true);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "feedback",
          role,
          question: questions[idx],
          answer,
        }),
      });
      const json = await res.json();
      if (res.ok) setFeedback(json.feedback || "");
    } finally {
      setThinking(false);
    }
  }

  function next() {
    if (idx + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setIdx((i) => i + 1);
    setAnswer("");
    setFeedback("");
  }

  function restart() {
    setStarted(false);
    setFinished(false);
    setQuestions([]);
    setAnswer("");
    setFeedback("");
  }

  function toggleMic() {
    if (speech.listening) speech.stop();
    else speech.start();
  }

  if (!started) {
    return (
      <form onSubmit={start} className="max-w-xl">
        <p className="mb-3 text-muted-foreground">
          The AI will ask you common questions for your role, one at a time, and
          give you kind feedback after each answer. You can type or speak.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Role you're practising for, e.g. sales associate"
            className="flex-1 rounded-lg border border-border bg-card px-3 py-2.5 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Bot className="h-4 w-4" />
            )}
            Start mock interview
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </form>
    );
  }

  if (finished) {
    return (
      <div className="rounded-2xl border border-border bg-secondary/40 p-8 text-center">
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary">
          <PartyPopper className="h-7 w-7" />
        </span>
        <h3 className="mt-4 font-display text-xl font-bold">You did it!</h3>
        <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
          You answered all {questions.length} questions. Every practice round makes
          the real thing easier.
        </p>
        <button
          type="button"
          onClick={restart}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
        >
          <RotateCcw className="h-4 w-4" /> Practise again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Question {idx + 1} of {questions.length}
        </span>
        <button type="button" onClick={restart} className="hover:text-foreground">
          End
        </button>
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
          <p className="pt-1.5 font-medium">{questions[idx]}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="relative">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={
              speech.listening ? "Listening… speak now" : "Type or speak your answer…"
            }
            className="min-h-28 w-full rounded-xl border border-border bg-card p-3 pr-12 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {speech.supported && (
            <button
              type="button"
              onClick={toggleMic}
              aria-label={speech.listening ? "Stop microphone" : "Use microphone"}
              className={`absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                speech.listening
                  ? "bg-destructive text-destructive-foreground"
                  : "border border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              {speech.listening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={submit}
            disabled={thinking || !answer.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-60"
          >
            {thinking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Get feedback
          </button>
          {feedback && (
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              {idx + 1 >= questions.length ? "Finish" : "Next question"}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div className="mt-4 rounded-xl border border-border bg-secondary/40 p-4">
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
            {feedback}
          </p>
        </div>
      )}
    </div>
  );
}