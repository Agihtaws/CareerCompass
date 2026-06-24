import { GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { LearnExplorer } from "@/components/learn-explorer";

export const metadata = { title: "Learn — CareerCompass" };

export default function LearnPage() {
  return (
    <div>
      <PageHeader
        icon={GraduationCap}
        title="Learn"
        description="Search any skill to get a free study plan, real video courses, and trusted free platforms."
      />
      <LearnExplorer />
    </div>
  );
}
