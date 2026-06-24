import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { AskTabs } from "@/components/ask-tabs";

export const metadata = { title: "Ask AI — CareerCompass" };

export default function AskPage() {
  return (
    <div>
      <PageHeader
        icon={Sparkles}
        title="Ask AI"
        description="Chat with your AI helper, read PDFs and images, and turn anything into flashcards."
      />
      <AskTabs />
    </div>
  );
}
