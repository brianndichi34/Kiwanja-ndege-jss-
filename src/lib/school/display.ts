import { DEFAULT_APPEARANCE, type AppearancePalette } from "@/lib/school/model";

export type DisplayThemeId = "classic" | "forest" | "royal" | "burgundy" | "rainbow" | "sunset" | "ocean" | "lavender" | "monochrome";
export type DisplayDensity = "comfortable" | "compact";
export type LocalDisplayPreferences = {
  theme: DisplayThemeId | null;
  density: DisplayDensity;
  motion: boolean;
  fontFamily: "sans" | "serif" | "system" | "mono";
  fontScale: "small" | "normal" | "large";
  accentMotion: boolean;
};

export const DISPLAY_PREFERENCES_KEY = "kiwanja-display-preferences-v1";
export const DEFAULT_DISPLAY_PREFERENCES: LocalDisplayPreferences = {
  theme: null,
  density: "comfortable",
  motion: true,
  fontFamily: "sans",
  fontScale: "normal",
  accentMotion: true,
};

export const DISPLAY_PALETTES: Array<{ id: DisplayThemeId; name: string; colors: AppearancePalette }> = [
  { id: "classic", name: "Kiwanja classic", colors: DEFAULT_APPEARANCE },
  { id: "forest", name: "Forest green", colors: { ...DEFAULT_APPEARANCE, navy: "#173d32", brass: "#c08b35", paper: "#eef5ef", card: "#ffffff", line: "#cfdfd4", info: "#28765c" } },
  { id: "royal", name: "Royal blue", colors: { ...DEFAULT_APPEARANCE, navy: "#173c78", brass: "#e0a12e", paper: "#eef3fb", card: "#ffffff", line: "#d3deef", info: "#2864b0" } },
  { id: "burgundy", name: "Burgundy", colors: { ...DEFAULT_APPEARANCE, navy: "#67243b", brass: "#c28a45", paper: "#f8eff2", card: "#ffffff", line: "#ead5dd", info: "#7252a3" } },
  { id: "rainbow", name: "Rainbow spectrum", colors: { ...DEFAULT_APPEARANCE, navy: "#5b21b6", navy2: "#7c3aed", brass: "#f59e0b", brassSoft: "#fcd34d", paper: "#fff7ed", card: "#ffffff", line: "#fed7aa", info: "#0891b2", good: "#16a34a" } },
  { id: "sunset", name: "Sunset coral", colors: { ...DEFAULT_APPEARANCE, navy: "#7f1d1d", navy2: "#991b1b", brass: "#f97316", brassSoft: "#fdba74", paper: "#fff7ed", card: "#ffffff", line: "#fed7aa", info: "#db2777" } },
  { id: "ocean", name: "Ocean teal", colors: { ...DEFAULT_APPEARANCE, navy: "#083344", navy2: "#155e75", brass: "#14b8a6", brassSoft: "#99f6e4", paper: "#ecfeff", card: "#ffffff", line: "#a5f3fc", info: "#0284c7" } },
  { id: "lavender", name: "Lavender bloom", colors: { ...DEFAULT_APPEARANCE, navy: "#4c1d95", navy2: "#6d28d9", brass: "#c026d3", brassSoft: "#f0abfc", paper: "#faf5ff", card: "#ffffff", line: "#e9d5ff", info: "#7c3aed" } },
  { id: "monochrome", name: "Monochrome", colors: { ...DEFAULT_APPEARANCE, navy: "#111827", navy2: "#374151", brass: "#4b5563", brassSoft: "#9ca3af", paper: "#f9fafb", card: "#ffffff", line: "#d1d5db", info: "#4b5563" } },
];

export function normalizeDisplayPreferences(value: unknown): LocalDisplayPreferences {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const theme = source.theme === null || DISPLAY_PALETTES.some((palette) => palette.id === source.theme)
    ? source.theme as DisplayThemeId | null
    : DEFAULT_DISPLAY_PREFERENCES.theme;
  return {
    theme,
    density: source.density === "compact" ? "compact" : "comfortable",
    motion: typeof source.motion === "boolean" ? source.motion : DEFAULT_DISPLAY_PREFERENCES.motion,
    fontFamily: source.fontFamily === "serif" || source.fontFamily === "system" || source.fontFamily === "mono" ? source.fontFamily : "sans",
    fontScale: source.fontScale === "small" || source.fontScale === "large" ? source.fontScale : "normal",
    accentMotion: typeof source.accentMotion === "boolean" ? source.accentMotion : DEFAULT_DISPLAY_PREFERENCES.accentMotion,
  };
}

export function readDisplayPreferences(): LocalDisplayPreferences {
  if (typeof window === "undefined") return DEFAULT_DISPLAY_PREFERENCES;
  try {
    return normalizeDisplayPreferences(JSON.parse(window.localStorage.getItem(DISPLAY_PREFERENCES_KEY) || "{}"));
  } catch {
    return DEFAULT_DISPLAY_PREFERENCES;
  }
}

export function saveDisplayPreferences(value: LocalDisplayPreferences) {
  const preferences = normalizeDisplayPreferences(value);
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem(DISPLAY_PREFERENCES_KEY, JSON.stringify(preferences)); } catch { /* Keep the live display usable when browser storage is unavailable. */ }
  }
  applyDisplayPreferences(preferences);
}

export function applyDisplayPreferences(value: LocalDisplayPreferences) {
  if (typeof document === "undefined") return;
  const preferences = normalizeDisplayPreferences(value);
  const root = document.documentElement;
  const colors = DISPLAY_PALETTES.find((palette) => palette.id === preferences.theme)?.colors ?? (() => {
    try {
      const raw = JSON.parse(root.dataset.schoolAppearance || "null") as Record<string, unknown> | null;
      if (!raw) return null;
      const schoolColors = { ...DEFAULT_APPEARANCE };
      (Object.keys(schoolColors) as Array<keyof AppearancePalette>).forEach((key) => {
        if (typeof raw[key] === "string" && /^#[0-9a-f]{6}$/i.test(raw[key] as string)) schoolColors[key] = raw[key] as string;
      });
      return schoolColors;
    } catch {
      return null;
    }
  })();
  const cssNames: Record<keyof AppearancePalette, string> = {
    navy: "--color-navy", navy2: "--color-navy-2", brass: "--color-brass", brassSoft: "--color-brass-soft",
    paper: "--color-paper", card: "--color-card", ink: "--color-ink", muted: "--color-muted", line: "--color-line",
    good: "--color-good", warn: "--color-warn", bad: "--color-bad", info: "--color-info",
  };
  if (colors) (Object.keys(cssNames) as Array<keyof AppearancePalette>).forEach((key) => root.style.setProperty(cssNames[key], colors[key]));
  root.dataset.portalDensity = preferences.density;
  root.dataset.portalMotion = preferences.motion ? "full" : "reduced";
  root.dataset.portalAccentMotion = preferences.accentMotion ? "on" : "off";
  root.dataset.portalFont = preferences.fontFamily;
  root.style.fontSize = `${preferences.density === "compact" ? 93.75 : preferences.fontScale === "small" ? 93.75 : preferences.fontScale === "large" ? 108 : 100}%`;
}
