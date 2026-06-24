import { MessageSquareHeart } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { InterviewTabs } from "@/components/interview-tabs";

export const metadata = { title: "Interview & Confidence — CareerCompass" };

export default function InterviewPage() {
  return (
    <div>
      <PageHeader
        icon={MessageSquareHeart}
        title="Interview & Confidence"
        description="Practise interview questions, run a mock interview, and build your spoken-English confidence — with a kind AI coach."
      />
      <InterviewTabs />
    </div>
  );
}
