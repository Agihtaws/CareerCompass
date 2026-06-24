// Pure constants + helpers used by the resume builder (safe for client use).

export const STORAGE_KEY = "careercompass.resume.v1";

export const TEMPLATES = [
  { id: "modern", label: "Modern" },
  { id: "classic", label: "Classic" },
  { id: "minimal", label: "Minimal" },
  { id: "sidebar", label: "Sidebar" },
  { id: "banner", label: "Banner" },
];
export const TEMPLATE_IDS = TEMPLATES.map((t) => t.id);

export const COLORS = [
  { id: "indigo", label: "Indigo", hex: "#4f46e5" },
  { id: "teal", label: "Teal", hex: "#0d9488" },
  { id: "rose", label: "Rose", hex: "#e11d48" },
  { id: "amber", label: "Amber", hex: "#d97706" },
  { id: "emerald", label: "Emerald", hex: "#059669" },
  { id: "slate", label: "Slate", hex: "#334155" },
];
export const COLOR_HEXES = COLORS.map((c) => c.hex);
export const DEFAULT_COLOR = "#4f46e5";

export const SECTION_LABELS = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  languages: "Languages",
  projects: "Projects",
  certifications: "Certifications",
  awards: "Awards",
  custom: "Custom section",
};
export const SECTION_KEYS = Object.keys(SECTION_LABELS);
export const DEFAULT_ORDER = [
  "summary",
  "experience",
  "education",
  "skills",
  "languages",
  "projects",
];

export function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function sampleResume() {
  return {
    contact: {
      name: "Meera Kannan",
      title: "Aspiring UI/UX Designer",
      email: "meera@email.com",
      phone: "+91 90000 00000",
      location: "Salem, Tamil Nadu",
      links: [{ id: "lnk1", label: "Portfolio", url: "behance.net/meera" }],
    },
    summary:
      "Creative and detail-oriented design student with a passion for clean, accessible interfaces and a fast-growing Figma toolkit.",
    experience: [
      {
        id: "exp1",
        role: "Design Intern",
        org: "BrightApps",
        from: "2025",
        to: "2025",
        bullets: [
          "Designed onboarding screens that improved sign-up completion",
          "Built a reusable component library in Figma",
        ],
      },
    ],
    education: [
      {
        id: "edu1",
        degree: "Higher Secondary (Computer Science)",
        school: "Govt. Hr. Sec. School, Salem",
        from: "2022",
        to: "2024",
        grade: "78%",
      },
    ],
    skills: "Figma, Wireframing, Prototyping, HTML & CSS",
    languages: "English (Fluent), Tamil (Native)",
    projects: [
      {
        id: "prj1",
        name: "Bus tracker app",
        detail: "A concept app to track local buses in real time.",
        link: "",
        year: "2024",
      },
    ],
    certifications: [],
    awards: [],
    custom: { title: "Internships", items: [] },
  };
}

export function blankResume() {
  return {
    contact: { name: "", title: "", email: "", phone: "", location: "", links: [] },
    summary: "",
    experience: [],
    education: [],
    skills: "",
    languages: "",
    projects: [],
    certifications: [],
    awards: [],
    custom: { title: "Internships", items: [] },
  };
}

// Normalise any saved/older resume so all current fields exist and have the
// right types (skills/languages are now plain text, dates are from/to, etc.).
export function mergeResume(saved) {
  const base = blankResume();
  if (!saved || typeof saved !== "object") return base;

  const asText = (v) => (Array.isArray(v) ? v.join(", ") : typeof v === "string" ? v : "");

  const contact = { ...base.contact, ...(saved.contact || {}) };
  if (typeof contact.links === "string") {
    contact.links = contact.links.trim()
      ? [{ id: uid(), label: "Link", url: contact.links.trim() }]
      : [];
  } else if (Array.isArray(contact.links)) {
    contact.links = contact.links.map((l) => ({
      id: l.id || uid(),
      label: l.label || "Link",
      url: l.url || "",
    }));
  } else {
    contact.links = [];
  }

  return {
    ...base,
    ...saved,
    contact,
    summary: typeof saved.summary === "string" ? saved.summary : "",
    skills: asText(saved.skills),
    languages: asText(saved.languages),
    experience: Array.isArray(saved.experience)
      ? saved.experience.map((e) => ({
          id: e.id || uid(),
          role: e.role || "",
          org: e.org || "",
          from: e.from || e.dates || "",
          to: e.to || "",
          bullets: Array.isArray(e.bullets) ? e.bullets : [],
        }))
      : [],
    education: Array.isArray(saved.education)
      ? saved.education.map((e) => ({
          id: e.id || uid(),
          degree: e.degree || "",
          school: e.school || "",
          from: e.from || e.dates || "",
          to: e.to || "",
          grade: e.grade || e.detail || "",
        }))
      : [],
    projects: Array.isArray(saved.projects)
      ? saved.projects.map((p) => ({
          id: p.id || uid(),
          name: p.name || "",
          detail: p.detail || "",
          link: p.link || "",
          year: p.year || "",
        }))
      : [],
    certifications: Array.isArray(saved.certifications) ? saved.certifications : [],
    awards: Array.isArray(saved.awards) ? saved.awards : [],
    custom: {
      title: saved.custom?.title || base.custom.title,
      items: Array.isArray(saved.custom?.items) ? saved.custom.items : [],
    },
  };
}