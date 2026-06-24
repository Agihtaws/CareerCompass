import { Briefcase } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { CareersExplorer } from "@/components/careers-explorer";

export const metadata = { title: "Explore Careers — CareerCompass" };

export default function CareersPage() {
  return (
    <div>
      <PageHeader
        icon={Briefcase}
        title="Explore Careers"
        description="Search a job to see what it really involves, the skills it needs, and openings hiring now."
      />
      <CareersExplorer />
    </div>
  );
}
