"use client";

import { useState } from "react";
import { MessageCircle, FileText, Layers } from "lucide-react";
import { AskChat } from "@/components/ask-chat";
import { AskDocument } from "@/components/ask-document";
import { AskFlashcards } from "@/components/ask-flashcards";

const TABS = [
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "doc", label: "Read a document", icon: FileText },
  { id: "cards", label: "Flashcards", icon: Layers },
];

export function AskTabs() {
  const [tab, setTab] = useState("chat");
  const [docText, setDocText] = useState("");

  return (
    <div>
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`-mb-px inline-flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "chat" && <AskChat />}
      {tab === "doc" && (
        <AskDocument
          docText={docText}
          setDocText={setDocText}
          goToFlashcards={() => setTab("cards")}
        />
      )}
      {tab === "cards" && <AskFlashcards initialText={docText} />}
    </div>
  );
}