"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Sparkles, User, Trash2 } from "lucide-react";
import { Markdown } from "@/components/markdown";

const CHAT_KEY = "careercompass.chat.v1";

const SUGGESTIONS = [
  "How do I start learning coding for free?",
  "What careers suit someone who likes drawing?",
  "Help me feel less nervous before an interview",
];

export function AskChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  // Load any saved conversation once.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHAT_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length) setMessages(arr);
      }
    } catch {}
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function persist(arr) {
    try {
      localStorage.setItem(CHAT_KEY, JSON.stringify(arr));
    } catch {}
  }

  async function send(text) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const next = [...messages, { role: "user", content }];
    setMessages(next);
    persist(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "chat", messages: next }),
      });
      const json = await res.json();
      const full = [
        ...next,
        {
          role: "assistant",
          content: res.ok
            ? json.reply || "…"
            : json.error || "Sorry, something went wrong.",
        },
      ];
      setMessages(full);
      persist(full);
    } catch {
      const full = [
        ...next,
        { role: "assistant", content: "Network error — please try again." },
      ];
      setMessages(full);
      persist(full);
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    setMessages([]);
    try {
      localStorage.removeItem(CHAT_KEY);
    } catch {}
  }

  return (
    <div className="flex h-[70vh] flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <div className="py-8">
            <div className="mb-4 flex items-center gap-2 text-muted-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>
                Ask me to explain anything in simple words, or for help with
                careers, courses, and studying.
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-xl border border-border bg-card p-3 text-left text-sm transition-colors hover:border-primary/40 hover:bg-muted"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "assistant" && (
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                <Sparkles className="h-4 w-4" />
              </span>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                m.role === "user"
                  ? "whitespace-pre-line bg-primary text-sm leading-relaxed text-primary-foreground"
                  : "border border-border bg-card text-foreground"
              }`}
            >
              {m.role === "assistant" ? (
                <Markdown>{m.content}</Markdown>
              ) : (
                m.content
              )}
            </div>
            {m.role === "user" && (
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <User className="h-4 w-4" />
              </span>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Thinking…</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Type your message… (Enter to send, Shift+Enter for a new line)"
            className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-border bg-card px-4 py-2.5 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearChat}
              aria-label="Clear chat"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-muted"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}