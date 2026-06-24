import { Bookmark } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { MyStuff } from "@/components/my-stuff";

export const metadata = { title: "My Stuff — CareerCompass" };

export default function SavedPage() {
  return (
    <div>
      <PageHeader
        icon={Bookmark}
        title="My Stuff"
        description="Your saved resume, flashcard sets, courses, and careers — all in one place."
      />
      <MyStuff />
    </div>
  );
}
