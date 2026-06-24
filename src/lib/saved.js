// Small, safe localStorage helpers shared across CareerCompass.
// All reads/writes are guarded so they never crash during SSR or in private mode.

const KEYS = {
  resume: "careercompass.resume.v1",
  flashcards: "careercompass.flashcards.v1",
  videos: "careercompass.videos.v1",
  careers: "careercompass.careers.v1",
};

const EVENT = "careercompass:saved-changed";

function read(key) {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function write(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    window.dispatchEvent(new Event(EVENT));
  } catch {}
}
function notify() {
  try {
    window.dispatchEvent(new Event(EVENT));
  } catch {}
}

// Let components refresh when saved data changes (same tab) or on focus.
export function onSavedChange(handler) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, handler);
  window.addEventListener("focus", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("focus", handler);
  };
}

export function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/* ---------- Resume ---------- */
export function getSavedResume() {
  return read(KEYS.resume);
}
export function removeSavedResume() {
  try {
    localStorage.removeItem(KEYS.resume);
    notify();
  } catch {}
}

/* ---------- Flashcard sets ---------- */
export function getFlashcardSets() {
  const v = read(KEYS.flashcards);
  return Array.isArray(v) ? v : [];
}
export function removeFlashcardSet(id) {
  write(KEYS.flashcards, getFlashcardSets().filter((s) => s.id !== id));
}

/* ---------- Saved videos ---------- */
export function getSavedVideos() {
  const v = read(KEYS.videos);
  return Array.isArray(v) ? v : [];
}
export function isVideoSaved(id) {
  return getSavedVideos().some((v) => v.id === id);
}
export function toggleVideo(video) {
  const list = getSavedVideos();
  const exists = list.some((v) => v.id === video.id);
  const next = exists
    ? list.filter((v) => v.id !== video.id)
    : [
        {
          id: video.id,
          title: video.title,
          channel: video.channel,
          thumbnail: video.thumbnail,
          url: video.url,
          duration: video.duration,
          savedAt: Date.now(),
        },
        ...list,
      ];
  write(KEYS.videos, next.slice(0, 100));
  return !exists;
}
export function removeVideo(id) {
  write(KEYS.videos, getSavedVideos().filter((v) => v.id !== id));
}

/* ---------- Saved careers ---------- */
export function getSavedCareers() {
  const v = read(KEYS.careers);
  return Array.isArray(v) ? v : [];
}
export function isCareerSaved(id) {
  return getSavedCareers().some((c) => c.id === id);
}
export function toggleCareer(career) {
  const list = getSavedCareers();
  const exists = list.some((c) => c.id === career.id);
  const next = exists
    ? list.filter((c) => c.id !== career.id)
    : [{ id: career.id, title: career.title, savedAt: Date.now() }, ...list];
  write(KEYS.careers, next.slice(0, 100));
  return !exists;
}
export function removeCareer(id) {
  write(KEYS.careers, getSavedCareers().filter((c) => c.id !== id));
}