import {
  LayoutDashboard,
  Briefcase,
  GraduationCap,
  FileText,
  MessageSquareHeart,
  Sparkles,
  Bookmark,
} from "lucide-react";

/**
 * One list that powers BOTH the sidebar and the home dashboard cards.
 * Add or reorder a section here and it updates everywhere.
 */
export const navItems = [
  {
    href: "/",
    label: "Home",
    description: "Your dashboard and starting point.",
    icon: LayoutDashboard,
  },
  {
    href: "/careers",
    label: "Explore Careers",
    description: "See real jobs, the skills they need, and where you stand.",
    icon: Briefcase,
  },
  {
    href: "/learn",
    label: "Learn",
    description: "Find free courses and video tutorials for any skill.",
    icon: GraduationCap,
  },
  {
    href: "/resume",
    label: "Resume",
    description: "Build a resume from clean templates and save your own.",
    icon: FileText,
  },
  {
    href: "/interview",
    label: "Interview & Confidence",
    description: "Practice questions and speak English in a private room.",
    icon: MessageSquareHeart,
  },
  {
    href: "/ask",
    label: "Ask AI",
    description: "A chatbot for doubts, plus PDF, image and flashcard tools.",
    icon: Sparkles,
  },
  {
    href: "/saved",
    label: "My Stuff",
    description: "Everything you saved — courses, resumes and flashcards.",
    icon: Bookmark,
  },
];