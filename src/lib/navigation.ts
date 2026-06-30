export const QUANTUM_HASH = "quantum";

export const AI_SECTION_HASHES = [
  "ai",
  "topics",
  "vendors",
  "github",
  "articles",
  "discover",
] as const;

export type AiSectionHash = (typeof AI_SECTION_HASHES)[number];

export const NAV_EVENT = "ai-pulse-navigate";

export function isAiSectionHash(hash: string): hash is AiSectionHash {
  return (AI_SECTION_HASHES as readonly string[]).includes(hash);
}

export function scrollToSection(id: string, delayMs = 80): void {
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, delayMs);
}

/** Navigate via hash + custom event so tab panels sync before scroll */
export function navigateToHash(hash: string): void {
  const id = hash.replace(/^#/, "");
  window.history.replaceState(null, "", `#${id}`);
  window.dispatchEvent(
    new CustomEvent(NAV_EVENT, { detail: { hash: id } })
  );
}