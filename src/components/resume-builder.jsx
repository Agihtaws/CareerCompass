"use client";

import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Loader2,
  Download,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
  Check,
} from "lucide-react";
import {
  TEMPLATES,
  COLORS,
  DEFAULT_COLOR,
  SECTION_LABELS,
  SECTION_KEYS,
  DEFAULT_ORDER,
  STORAGE_KEY,
  sampleResume,
  blankResume,
  mergeResume,
  uid,
} from "@/lib/resume-config";

const inputCls =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

const splitList = (s) =>
  (s || "").split(",").map((x) => x.trim()).filter(Boolean);
const dateRange = (from, to) => [from, to].filter(Boolean).join(" – ");

function normalizeUrl(u) {
  const s = (u || "").trim();
  if (!s) return "#";
  if (/^https?:\/\//i.test(s)) return s;
  if (s.includes("@")) return `mailto:${s}`;
  return `https://${s}`;
}

const LINK_PRESETS = ["LinkedIn", "GitHub", "Portfolio", "Website"];

const A4_W = 794;
const A4_H = 1123;

const SIDEBAR_SECTIONS = ["skills", "languages", "certifications", "awards"];
const MAIN_SECTIONS = ["summary", "experience", "education", "projects", "custom"];


function SummaryBody({ text }) {
  return <p className="text-sm leading-relaxed text-zinc-700">{text}</p>;
}
function ExperienceBody({ items }) {
  return (
    <div className="space-y-3">
      {items.map((e) => (
        <div key={e.id}>
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-semibold text-zinc-900">
              {e.role || "Role"}
              {e.org ? `, ${e.org}` : ""}
            </p>
            {dateRange(e.from, e.to) && (
              <span className="shrink-0 text-xs text-zinc-500">{dateRange(e.from, e.to)}</span>
            )}
          </div>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-zinc-700">
            {e.bullets.filter((b) => b.trim()).map((b, bi) => (
              <li key={bi}>{b}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
function EducationBody({ items }) {
  return (
    <div className="space-y-2.5">
      {items.map((e) => (
        <div key={e.id}>
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-semibold text-zinc-900">{e.degree || "Qualification"}</p>
            {dateRange(e.from, e.to) && (
              <span className="shrink-0 text-xs text-zinc-500">{dateRange(e.from, e.to)}</span>
            )}
          </div>
          {e.school && <p className="text-sm text-zinc-700">{e.school}</p>}
          {e.grade && <p className="text-xs text-zinc-600">{e.grade}</p>}
        </div>
      ))}
    </div>
  );
}
function ProjectsBody({ items }) {
  return (
    <div className="space-y-1.5">
      {items.map((p) => (
        <div key={p.id} className="flex items-baseline justify-between gap-3">
          <p className="text-sm text-zinc-700">
            <span className="font-semibold text-zinc-900">{p.name || "Project"}</span>
            {p.detail ? ` — ${p.detail}` : ""}
            {p.link ? ` (${p.link})` : ""}
          </p>
          {p.year && <span className="shrink-0 text-xs text-zinc-500">{p.year}</span>}
        </div>
      ))}
    </div>
  );
}
function SimpleListBody({ items }) {
  return (
    <div className="space-y-1">
      {items.map((it) => (
        <p key={it.id} className="text-sm text-zinc-700">
          <span className="font-semibold text-zinc-900">{it.name || "—"}</span>
          {it.detail ? ` — ${it.detail}` : ""}
        </p>
      ))}
    </div>
  );
}
function CustomBody({ custom }) {
  return (
    <ul className="list-disc space-y-0.5 pl-5 text-sm text-zinc-700">
      {custom.items.filter((x) => x.trim()).map((x, i) => (
        <li key={i}>{x}</li>
      ))}
    </ul>
  );
}
function SkillsChips({ list, light }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {list.map((sk) => (
        <span
          key={sk}
          className={
            light
              ? "rounded border border-white/40 px-2 py-0.5 text-xs text-white"
              : "rounded border border-zinc-300 px-2 py-0.5 text-xs text-zinc-700"
          }
        >
          {sk}
        </span>
      ))}
    </div>
  );
}

function hasContent(key, data, skillsList, languagesList) {
  switch (key) {
    case "summary": return !!data.summary.trim();
    case "experience": return data.experience.length > 0;
    case "education": return data.education.length > 0;
    case "skills": return skillsList.length > 0;
    case "languages": return languagesList.length > 0;
    case "projects": return data.projects.length > 0;
    case "certifications": return data.certifications.length > 0;
    case "awards": return data.awards.length > 0;
    case "custom": return data.custom.items.filter((x) => x.trim()).length > 0;
    default: return false;
  }
}
// Dark body for main/single columns.
function DarkBody({ k, data, skillsList, languagesList }) {
  if (k === "summary") return <SummaryBody text={data.summary} />;
  if (k === "experience") return <ExperienceBody items={data.experience} />;
  if (k === "education") return <EducationBody items={data.education} />;
  if (k === "projects") return <ProjectsBody items={data.projects} />;
  if (k === "skills") return <SkillsChips list={skillsList} />;
  if (k === "languages")
    return <p className="text-sm text-zinc-700">{languagesList.join("   •   ")}</p>;
  if (k === "certifications") return <SimpleListBody items={data.certifications} />;
  if (k === "awards") return <SimpleListBody items={data.awards} />;
  if (k === "custom") return <CustomBody custom={data.custom} />;
  return null;
}

function nameClass(template) {
  if (template === "classic") return "text-center text-3xl font-bold tracking-tight text-zinc-900";
  if (template === "minimal") return "text-2xl font-semibold text-zinc-900";
  return "text-3xl font-bold text-zinc-900";
}
function headingClass(template) {
  if (template === "classic")
    return "mb-2 border-b border-zinc-300 pb-1 text-sm font-bold uppercase tracking-widest";
  if (template === "minimal")
    return "mb-2 text-xs font-semibold uppercase tracking-widest";
  return "mb-2 pb-1 text-sm font-bold uppercase tracking-wide";
}

async function callImprove(kind, text) {
  const system =
    "You are an expert resume writer. Return ONLY the improved text — no preamble, no quotes, no markdown.";
  const prompt =
    kind === "summary"
      ? `Rewrite this into a punchy 2-3 sentence professional resume summary. Keep it truthful and concise:\n\n${text}`
      : `Rewrite this into ONE strong resume bullet that starts with an action verb, is specific, and is under 25 words:\n\n${text}`;
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, prompt }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "AI request failed");
  return (json.text || "").trim();
}

function AiButton({ onClick, busy, label = "Improve with AI" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-secondary disabled:opacity-60"
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}

function SectionCard({ title, sectionKey, order, onMove, onRemove, children }) {
  const idx = order.indexOf(sectionKey);
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold">{title}</h3>
        <div className="flex items-center gap-1">
          <button type="button" aria-label="Move up" disabled={idx <= 0} onClick={() => onMove(sectionKey, -1)} className="rounded-md p-1 text-muted-foreground hover:bg-muted disabled:opacity-30">
            <ChevronUp className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Move down" disabled={idx === order.length - 1} onClick={() => onMove(sectionKey, 1)} className="rounded-md p-1 text-muted-foreground hover:bg-muted disabled:opacity-30">
            <ChevronDown className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Remove section" onClick={() => onRemove(sectionKey)} className="rounded-md p-1 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ---------- the three preview layouts ---------- */
function ResumePreview({ template, color, data, order, skillsList, languagesList }) {
  const linkList = (data.contact.links || []).filter((l) => l.url && l.url.trim());
  const inlineContact = (className, linkStyle) => {
    const nodes = [];
    if (data.contact.email) nodes.push(<span key="email">{data.contact.email}</span>);
    if (data.contact.phone) nodes.push(<span key="phone">{data.contact.phone}</span>);
    if (data.contact.location) nodes.push(<span key="loc">{data.contact.location}</span>);
    linkList.forEach((l) =>
      nodes.push(
        <a key={l.id} href={normalizeUrl(l.url)} target="_blank" rel="noopener noreferrer" className="underline" style={linkStyle}>
          {l.label || "Link"}
        </a>
      )
    );
    if (!nodes.length) return null;
    return (
      <p className={className}>
        {nodes.flatMap((n, i) => (i ? [<span key={`s${i}`} className="px-2 opacity-60">•</span>, n] : [n]))}
      </p>
    );
  };
  const has = (k) => hasContent(k, data, skillsList, languagesList);

  // SIDEBAR — coloured left column (like the green reference)
  if (template === "sidebar") {
    const sideKeys = SIDEBAR_SECTIONS.filter((k) => order.includes(k) && has(k));
    const mainKeys = order.filter((k) => MAIN_SECTIONS.includes(k) && has(k));
    return (
      <div className="flex min-h-[1123px]">
        <aside
          className="w-[34%] p-6 text-white"
          style={{ backgroundColor: color, printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
        >
          <h1 className="text-2xl font-bold leading-tight">{data.contact.name || "Your Name"}</h1>
          {data.contact.title && <p className="mt-1 text-sm text-white/80">{data.contact.title}</p>}
          <div className="mt-5 space-y-1 text-xs text-white/90">
            {data.contact.email && <p>{data.contact.email}</p>}
            {data.contact.phone && <p>{data.contact.phone}</p>}
            {data.contact.location && <p>{data.contact.location}</p>}
            {linkList.map((l) => (
              <p key={l.id} className="break-words">
                <a href={normalizeUrl(l.url)} target="_blank" rel="noopener noreferrer" className="underline">
                  {l.label || "Link"}
                </a>
              </p>
            ))}
          </div>
          {sideKeys.map((k) => (
            <div key={k} className="mt-6">
              <h2 className="mb-2 border-b border-white/30 pb-1 text-xs font-bold uppercase tracking-widest text-white">
                {k === "custom" ? data.custom.title : SECTION_LABELS[k]}
              </h2>
              {k === "skills" ? (
                <SkillsChips list={skillsList} light />
              ) : k === "languages" ? (
                <p className="text-xs text-white/90">{languagesList.join("  •  ")}</p>
              ) : (
                <div className="text-xs text-white/90">
                  {data[k].map((it) => (
                    <p key={it.id} className="mb-1">
                      <span className="font-semibold text-white">{it.name}</span>
                      {it.detail ? ` — ${it.detail}` : ""}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </aside>
        <div className="flex-1 p-8">
          <div className="space-y-5">
            {mainKeys.map((k) => (
              <section key={k}>
                <h2 className="mb-2 pb-1 text-sm font-bold uppercase tracking-wide" style={{ color, borderBottom: `2px solid ${color}` }}>
                  {k === "custom" ? data.custom.title : SECTION_LABELS[k]}
                </h2>
                <DarkBody k={k} data={data} skillsList={skillsList} languagesList={languagesList} />
              </section>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // BANNER — coloured top band (like the teal reference)
  if (template === "banner") {
    const keys = order.filter((k) => has(k));
    return (
      <div>
        <div
          className="px-8 py-7 text-center text-white"
          style={{ backgroundColor: color, printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
        >
          <h1 className="text-3xl font-bold uppercase tracking-[0.15em]">{data.contact.name || "Your Name"}</h1>
          {data.contact.title && <p className="mt-1 text-sm uppercase tracking-widest text-white/85">{data.contact.title}</p>}
          {inlineContact("mt-2 text-xs text-white/85", { color: "#fff" })}
        </div>
        <div className="space-y-5 p-8">
          {keys.map((k) => (
            <section key={k}>
              <h2 className="mb-2 pb-1 text-sm font-bold uppercase tracking-wide" style={{ color, borderBottom: `2px solid ${color}` }}>
                {k === "custom" ? data.custom.title : SECTION_LABELS[k]}
              </h2>
              <DarkBody k={k} data={data} skillsList={skillsList} languagesList={languagesList} />
            </section>
          ))}
        </div>
      </div>
    );
  }

  // SINGLE COLUMN — modern / classic / minimal
  const hStyle = template === "modern" ? { color, borderBottom: `2px solid ${color}` } : { color };
  const hClass = headingClass(template);
  return (
    <div className="p-8">
      <header className={template === "classic" ? "text-center" : ""}>
        <h1 className={nameClass(template)} style={template === "modern" ? { color } : undefined}>
          {data.contact.name || "Your Name"}
        </h1>
        {data.contact.title && <p className="mt-0.5 text-base text-zinc-600">{data.contact.title}</p>}
        {inlineContact("mt-1 text-xs text-zinc-600", { color })}
      </header>
      <div className="mt-5 space-y-5">
        {order.filter((k) => has(k)).map((k) => (
          <section key={k}>
            <h2 className={hClass} style={hStyle}>
              {k === "custom" ? data.custom.title : SECTION_LABELS[k]}
            </h2>
            <DarkBody k={k} data={data} skillsList={skillsList} languagesList={languagesList} />
          </section>
        ))}
      </div>
    </div>
  );
}

export function ResumeBuilder() {
  const [data, setData] = useState(sampleResume);
  const [template, setTemplate] = useState("modern");
  const [order, setOrder] = useState(DEFAULT_ORDER);
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [busy, setBusy] = useState(null);
  const [saved, setSaved] = useState(false);

  const wrapRef = useRef(null);
  const contentRef = useRef(null);
  const [viewScale, setViewScale] = useState(1);
  const [fitScale, setFitScale] = useState(1);

  // Scale the whole A4 page to fit the column / phone width.
  useEffect(() => {
    const measure = () => {
      const w = wrapRef.current?.clientWidth || A4_W;
      setViewScale(Math.min(1, w / A4_W));
    };
    measure();
    let ro;
    if (typeof ResizeObserver !== "undefined" && wrapRef.current) {
      ro = new ResizeObserver(measure);
      ro.observe(wrapRef.current);
    }
    window.addEventListener("resize", measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Shrink the content just enough to always fit one page.
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const natural = el.scrollHeight;
    setFitScale(natural > A4_H ? A4_H / natural : 1);
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.data) setData(mergeResume(s.data));
        if (s.template) setTemplate(s.template);
        if (Array.isArray(s.order) && s.order.length) setOrder(s.order);
        if (s.color) setColor(s.color);
      }
    } catch {}
  }, []);

  function saveLocal() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, template, order, color }));
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch {}
  }

  const setContact = (f, v) => setData((d) => ({ ...d, contact: { ...d.contact, [f]: v } }));
  const addLink = (label = "") =>
    setData((d) => ({ ...d, contact: { ...d.contact, links: [...(d.contact.links || []), { id: uid(), label, url: "" }] } }));
  const updateLink = (id, f, v) =>
    setData((d) => ({ ...d, contact: { ...d.contact, links: d.contact.links.map((l) => (l.id === id ? { ...l, [f]: v } : l)) } }));
  const removeLink = (id) =>
    setData((d) => ({ ...d, contact: { ...d.contact, links: d.contact.links.filter((l) => l.id !== id) } }));
  const addItem = (key, factory) => setData((d) => ({ ...d, [key]: [...d[key], factory()] }));
  const updateItem = (key, id, f, v) =>
    setData((d) => ({ ...d, [key]: d[key].map((it) => (it.id === id ? { ...it, [f]: v } : it)) }));
  const removeItem = (key, id) => setData((d) => ({ ...d, [key]: d[key].filter((it) => it.id !== id) }));

  const addBullet = (id) =>
    setData((d) => ({ ...d, experience: d.experience.map((e) => (e.id === id ? { ...e, bullets: [...e.bullets, ""] } : e)) }));
  const updateBullet = (id, i, v) =>
    setData((d) => ({ ...d, experience: d.experience.map((e) => (e.id === id ? { ...e, bullets: e.bullets.map((b, bi) => (bi === i ? v : b)) } : e)) }));
  const removeBullet = (id, i) =>
    setData((d) => ({ ...d, experience: d.experience.map((e) => (e.id === id ? { ...e, bullets: e.bullets.filter((_, bi) => bi !== i) } : e)) }));

  const setCustom = (f, v) => setData((d) => ({ ...d, custom: { ...d.custom, [f]: v } }));
  const addCustomItem = () => setData((d) => ({ ...d, custom: { ...d.custom, items: [...d.custom.items, ""] } }));
  const updateCustomItem = (i, v) => setData((d) => ({ ...d, custom: { ...d.custom, items: d.custom.items.map((x, xi) => (xi === i ? v : x)) } }));
  const removeCustomItem = (i) => setData((d) => ({ ...d, custom: { ...d.custom, items: d.custom.items.filter((_, xi) => xi !== i) } }));

  async function improveSummary() {
    if (!data.summary.trim()) return;
    setBusy("summary");
    try {
      const out = await callImprove("summary", data.summary);
      setData((d) => ({ ...d, summary: out }));
    } catch {
    } finally {
      setBusy(null);
    }
  }
  async function improveBullet(expId, i) {
    const exp = data.experience.find((e) => e.id === expId);
    const text = exp?.bullets[i] || "";
    if (!text.trim()) return;
    setBusy(`${expId}-${i}`);
    try {
      const out = await callImprove("bullet", text);
      updateBullet(expId, i, out);
    } catch {
    } finally {
      setBusy(null);
    }
  }

  const moveSection = (key, dir) =>
    setOrder((o) => {
      const i = o.indexOf(key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= o.length) return o;
      const n = [...o];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  const removeSection = (key) => setOrder((o) => o.filter((k) => k !== key));
  const addSection = (key) => setOrder((o) => (o.includes(key) ? o : [...o, key]));
  const hidden = SECTION_KEYS.filter((k) => !order.includes(k));

  const skillsList = splitList(data.skills);
  const languagesList = splitList(data.languages);

  return (
    <div>
      <style>{`
@media print {
  @page { size: A4; margin: 0; }
  html, body { background: #fff !important; }
  #resume-reserve { width: auto !important; height: auto !important; margin: 0 !important; }
  #resume-sheet {
    position: static !important;
    transform: none !important;
    width: 794px !important;
    height: 1123px !important;
    box-shadow: none !important; border: 0 !important; border-radius: 0 !important;
  }
}
      `}</style>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2 print:hidden">
        <select value={template} onChange={(e) => setTemplate(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>{t.label} template</option>
          ))}
        </select>
        <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90">
          <Download className="h-4 w-4" /> Download PDF
        </button>
        <button type="button" onClick={saveLocal} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">
          {saved ? <Check className="h-4 w-4 text-primary" /> : <Save className="h-4 w-4" />}
          {saved ? "Saved" : "Save"}
        </button>
        <button type="button" onClick={() => setData(sampleResume())} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">
          <RotateCcw className="h-4 w-4" /> Sample
        </button>
        <button type="button" onClick={() => setData(blankResume())} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">
          Clear
        </button>
      </div>

      {/* Colour picker */}
      <div className="mb-6 flex items-center gap-2 print:hidden">
        <span className="text-sm text-muted-foreground">Accent colour</span>
        {COLORS.map((c) => (
          <button key={c.id} type="button" aria-label={c.label} onClick={() => setColor(c.hex)} className={`h-7 w-7 rounded-full border-2 border-transparent transition-transform hover:scale-110 ${color === c.hex ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : ""}`} style={{ backgroundColor: c.hex }} />
        ))}
      </div>

      <p className="mb-6 text-xs text-muted-foreground print:hidden">
        Sidebar &amp; Banner templates fill the colour behind your name. When you Download
        PDF, untick “Headers and footers” and tick “Background graphics” in the dialog.
      </p>

      <div className="grid gap-8 lg:grid-cols-2 print:block">
        {/* EDITOR */}
        <div className="space-y-4 print:hidden">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 font-display text-sm font-semibold">Your details</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <input className={inputCls} placeholder="Full name" value={data.contact.name} onChange={(e) => setContact("name", e.target.value)} />
              <input className={inputCls} placeholder="Title (e.g. Web Developer)" value={data.contact.title} onChange={(e) => setContact("title", e.target.value)} />
              <input className={inputCls} placeholder="Email" value={data.contact.email} onChange={(e) => setContact("email", e.target.value)} />
              <input className={inputCls} placeholder="Phone" value={data.contact.phone} onChange={(e) => setContact("phone", e.target.value)} />
              <input className={inputCls} placeholder="Location" value={data.contact.location} onChange={(e) => setContact("location", e.target.value)} />
            </div>

            <div className="mt-3">
              <label className="mb-1.5 block text-sm font-medium">Links (optional)</label>
              <p className="mb-2 text-xs text-muted-foreground">
                Paste the URL and pick a label — it shows as a clickable word (e.g. “LinkedIn”), not the long link.
              </p>
              <div className="space-y-2">
                {(data.contact.links || []).map((l) => (
                  <div key={l.id} className="grid grid-cols-[1fr_1.6fr_auto] gap-2">
                    <input className={inputCls} placeholder="Label" value={l.label} onChange={(e) => updateLink(l.id, "label", e.target.value)} />
                    <input className={inputCls} placeholder="Paste URL" value={l.url} onChange={(e) => updateLink(l.id, "url", e.target.value)} />
                    <button type="button" onClick={() => removeLink(l.id)} className="rounded-md p-2 text-muted-foreground hover:bg-muted" aria-label="Remove link">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {LINK_PRESETS.map((p) => (
                  <button key={p} type="button" onClick={() => addLink(p)} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs hover:border-primary/40">
                    <Plus className="h-3.5 w-3.5" /> {p}
                  </button>
                ))}
                <button type="button" onClick={() => addLink("")} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs hover:border-primary/40">
                  <Plus className="h-3.5 w-3.5" /> Other
                </button>
              </div>
            </div>
          </div>

          {order.map((key) => {
            const cardProps = {
              title: key === "custom" ? data.custom.title || "Custom section" : SECTION_LABELS[key],
              sectionKey: key,
              order,
              onMove: moveSection,
              onRemove: removeSection,
            };

            if (key === "summary")
              return (
                <SectionCard key={key} {...cardProps}>
                  <textarea className={inputCls + " min-h-20"} placeholder="A sentence or two about you…" value={data.summary} onChange={(e) => setData((d) => ({ ...d, summary: e.target.value }))} />
                  <div className="mt-2"><AiButton onClick={improveSummary} busy={busy === "summary"} /></div>
                </SectionCard>
              );

            if (key === "experience")
              return (
                <SectionCard key={key} {...cardProps}>
                  <div className="space-y-4">
                    {data.experience.map((e) => (
                      <div key={e.id} className="rounded-lg border border-border p-3">
                        <div className="mb-2 grid gap-2 sm:grid-cols-2">
                          <input className={inputCls} placeholder="Profession / role" value={e.role} onChange={(ev) => updateItem("experience", e.id, "role", ev.target.value)} />
                          <input className={inputCls} placeholder="Company name" value={e.org} onChange={(ev) => updateItem("experience", e.id, "org", ev.target.value)} />
                          <input className={inputCls} placeholder="From (e.g. 2022)" value={e.from} onChange={(ev) => updateItem("experience", e.id, "from", ev.target.value)} />
                          <input className={inputCls} placeholder="To (e.g. 2024 or Present)" value={e.to} onChange={(ev) => updateItem("experience", e.id, "to", ev.target.value)} />
                        </div>
                        {e.bullets.map((b, bi) => (
                          <div key={bi} className="mb-2 flex items-start gap-2">
                            <input className={inputCls} placeholder="What you did…" value={b} onChange={(ev) => updateBullet(e.id, bi, ev.target.value)} />
                            <AiButton onClick={() => improveBullet(e.id, bi)} busy={busy === `${e.id}-${bi}`} label="" />
                            <button type="button" onClick={() => removeBullet(e.id, bi)} className="rounded-md p-2 text-muted-foreground hover:bg-muted" aria-label="Remove bullet"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        ))}
                        <div className="flex items-center justify-between">
                          <button type="button" onClick={() => addBullet(e.id)} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"><Plus className="h-3.5 w-3.5" /> Add point</button>
                          <button type="button" onClick={() => removeItem("experience", e.id)} className="text-xs text-muted-foreground hover:text-foreground">Remove role</button>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => addItem("experience", () => ({ id: uid(), role: "", org: "", from: "", to: "", bullets: [""] }))} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"><Plus className="h-4 w-4" /> Add experience</button>
                  </div>
                </SectionCard>
              );

            if (key === "education")
              return (
                <SectionCard key={key} {...cardProps}>
                  <div className="space-y-3">
                    {data.education.map((e) => (
                      <div key={e.id} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-2">
                        <input className={inputCls} placeholder="Degree / qualification" value={e.degree} onChange={(ev) => updateItem("education", e.id, "degree", ev.target.value)} />
                        <input className={inputCls} placeholder="School / college" value={e.school} onChange={(ev) => updateItem("education", e.id, "school", ev.target.value)} />
                        <input className={inputCls} placeholder="From (e.g. 2020)" value={e.from} onChange={(ev) => updateItem("education", e.id, "from", ev.target.value)} />
                        <input className={inputCls} placeholder="To (e.g. 2024)" value={e.to} onChange={(ev) => updateItem("education", e.id, "to", ev.target.value)} />
                        <input className={inputCls + " sm:col-span-2"} placeholder="CGPA / grade (e.g. 8.4 CGPA or 78%)" value={e.grade} onChange={(ev) => updateItem("education", e.id, "grade", ev.target.value)} />
                        <button type="button" onClick={() => removeItem("education", e.id)} className="text-left text-xs text-muted-foreground hover:text-foreground sm:col-span-2">Remove</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addItem("education", () => ({ id: uid(), degree: "", school: "", from: "", to: "", grade: "" }))} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"><Plus className="h-4 w-4" /> Add education</button>
                  </div>
                </SectionCard>
              );

            if (key === "skills")
              return (
                <SectionCard key={key} {...cardProps}>
                  <input className={inputCls} placeholder="Type skills separated by commas, e.g. Figma, HTML, Teamwork" value={data.skills} onChange={(e) => setData((d) => ({ ...d, skills: e.target.value }))} />
                  <p className="mt-1.5 text-xs text-muted-foreground">Separate each skill with a comma.</p>
                </SectionCard>
              );

            if (key === "languages")
              return (
                <SectionCard key={key} {...cardProps}>
                  <input className={inputCls} placeholder="e.g. English (Fluent), Tamil (Native)" value={data.languages} onChange={(e) => setData((d) => ({ ...d, languages: e.target.value }))} />
                  <p className="mt-1.5 text-xs text-muted-foreground">Separate each language with a comma.</p>
                </SectionCard>
              );

            if (key === "projects")
              return (
                <SectionCard key={key} {...cardProps}>
                  <div className="space-y-3">
                    {data.projects.map((p) => (
                      <div key={p.id} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-2">
                        <input className={inputCls} placeholder="Project name" value={p.name} onChange={(ev) => updateItem("projects", p.id, "name", ev.target.value)} />
                        <input className={inputCls} placeholder="Year (e.g. 2024)" value={p.year} onChange={(ev) => updateItem("projects", p.id, "year", ev.target.value)} />
                        <input className={inputCls + " sm:col-span-2"} placeholder="One line about it" value={p.detail} onChange={(ev) => updateItem("projects", p.id, "detail", ev.target.value)} />
                        <input className={inputCls + " sm:col-span-2"} placeholder="Link (optional)" value={p.link} onChange={(ev) => updateItem("projects", p.id, "link", ev.target.value)} />
                        <button type="button" onClick={() => removeItem("projects", p.id)} className="text-left text-xs text-muted-foreground hover:text-foreground sm:col-span-2">Remove</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addItem("projects", () => ({ id: uid(), name: "", detail: "", link: "", year: "" }))} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"><Plus className="h-4 w-4" /> Add project</button>
                  </div>
                </SectionCard>
              );

            if (key === "certifications" || key === "awards")
              return (
                <SectionCard key={key} {...cardProps}>
                  <div className="space-y-3">
                    {data[key].map((it) => (
                      <div key={it.id} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-2">
                        <input className={inputCls} placeholder={key === "awards" ? "Award" : "Certificate"} value={it.name} onChange={(ev) => updateItem(key, it.id, "name", ev.target.value)} />
                        <input className={inputCls} placeholder="Detail / year (optional)" value={it.detail} onChange={(ev) => updateItem(key, it.id, "detail", ev.target.value)} />
                        <button type="button" onClick={() => removeItem(key, it.id)} className="text-left text-xs text-muted-foreground hover:text-foreground sm:col-span-2">Remove</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addItem(key, () => ({ id: uid(), name: "", detail: "" }))} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"><Plus className="h-4 w-4" /> Add {key === "awards" ? "award" : "certificate"}</button>
                  </div>
                </SectionCard>
              );

            if (key === "custom")
              return (
                <SectionCard key={key} {...cardProps}>
                  <input className={inputCls + " mb-3 font-medium"} placeholder="Section title, e.g. Internships" value={data.custom.title} onChange={(e) => setCustom("title", e.target.value)} />
                  {data.custom.items.map((it, i) => (
                    <div key={i} className="mb-2 flex items-start gap-2">
                      <input className={inputCls} placeholder="A line…" value={it} onChange={(e) => updateCustomItem(i, e.target.value)} />
                      <button type="button" onClick={() => removeCustomItem(i)} className="rounded-md p-2 text-muted-foreground hover:bg-muted" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={addCustomItem} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"><Plus className="h-4 w-4" /> Add line</button>
                </SectionCard>
              );

            return null;
          })}

          {hidden.length > 0 && (
            <div className="rounded-xl border border-dashed border-border p-4">
              <p className="mb-2 text-sm text-muted-foreground">Add a section:</p>
              <div className="flex flex-wrap gap-2">
                {hidden.map((k) => (
                  <button key={k} type="button" onClick={() => addSection(k)} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-sm hover:border-primary/40">
                    <Plus className="h-3.5 w-3.5" /> {SECTION_LABELS[k]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PREVIEW — a real A4 page that fits one page and scales to any screen */}
        <div className="lg:sticky lg:top-6 lg:self-start print:static">
          <div ref={wrapRef} className="w-full">
            <div
              id="resume-reserve"
              className="relative mx-auto"
              style={{ width: A4_W * viewScale, height: A4_H * viewScale }}
            >
              <div
                id="resume-sheet"
                className="absolute left-0 top-0 origin-top-left overflow-hidden bg-white text-zinc-900 shadow-sm"
                style={{
                  width: A4_W,
                  height: A4_H,
                  transform: `scale(${viewScale})`,
                  printColorAdjust: "exact",
                  WebkitPrintColorAdjust: "exact",
                }}
              >
                <div
                  ref={contentRef}
                  style={{ width: A4_W, transform: `scale(${fitScale})`, transformOrigin: "top center" }}
                >
                  <ResumePreview
                    template={template}
                    color={color}
                    data={data}
                    order={order}
                    skillsList={skillsList}
                    languagesList={languagesList}
                  />
                </div>
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground print:hidden">
            Always fits one page. When you Download PDF, turn off “Headers and footers” in the dialog.
          </p>
        </div>
      </div>
    </div>
  );
}