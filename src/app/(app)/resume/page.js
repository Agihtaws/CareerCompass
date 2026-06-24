import { FileText } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ResumeBuilder } from "@/components/resume-builder";

export const metadata = { title: "Resume — CareerCompass" };

export default function ResumePage() {
  return (
    <div>
      <PageHeader
        icon={FileText}
        title="Resume"
        description="Build a clean resume, sharpen it with AI, save the layout for others, and download a PDF."
      />
      <ResumeBuilder />
    </div>
  );
}
