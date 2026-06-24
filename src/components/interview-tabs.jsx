"use client";

import { useState } from "react";
import { ListChecks, Bot, Mic } from "lucide-react";
import { QuestionBank } from "@/components/interview-question-bank";
import { MockInterview } from "@/components/interview-mock";
import { SpeakingRoom } from "@/components/interview-speaking";

const TABS = [
  { id: "bank", label: "Question Bank", icon: ListChecks },
  { id: "mock", label: "Mock Interview", icon: Bot },
  { id: "speak", label: "Voice Interview", icon: Mic },
];

export function InterviewTabs() {
  const [tab, setTab] = useState("bank");

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

      {tab === "bank" && <QuestionBank />}
      {tab === "mock" && <MockInterview />}
      {tab === "speak" && <SpeakingRoom />}
    </div>
  );
}