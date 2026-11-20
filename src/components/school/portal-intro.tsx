import { useEffect, useRef, useState } from "react";
import { getWelcomePage } from "@/lib/school/api";

const INTRO_SEEN_KEY = "kiwanja-ndege-portal-intro-seen-v1";
const INTRO_DURATION = 5200;

const VARIATIONS = [
  { id: "rainbow", name: "Rainbow Light" },
  { id: "golden", name: "Golden Light" },
  { id: "neon", name: "Neon" },
  { id: "rotating", name: "Rotating 3D" },
  { id: "ultimate", name: "Ultimate Welcome" },
] as const;

type IntroVariation = (typeof VARIATIONS)[number];
type IntroConfig = {
  enabled: boolean;
  variation: string;
  durationMs: number;
  repeatMode: string;
  skipEnabled: boolean;
  revision: number;
};

const DEFAULT_CONFIG: IntroConfig = {
  enabled: true,
  variation: "random",
  durationMs: INTRO_DURATION,
  repeatMode: "once",
  skipEnabled: true,
  revision: 1,
};

function randomVariation() {
  return VARIATIONS[Math.floor(Math.random() * VARIATIONS.length)] ?? VARIATIONS[0];
}

function selectedVariation(value: string) {
  return value === "random" ? randomVariation() : VARIATIONS.find((item) => item.id === value) ?? randomVariation();
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function hasSeenIntro(key: string) {
  if (!canUseStorage()) return false;
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function rememberIntro(key: string) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, "1");
  } catch {
    // Private browsing or blocked storage should never block the login page.
  }
}

function normalizeConfig(data: Awaited<ReturnType<typeof getWelcomePage>>): IntroConfig {
  return {
    enabled: data.introEnabled ?? true,
    variation: data.introVariation || "random",
    durationMs: Math.max(1000, Math.min(10000, Number(data.introDurationMs) || INTRO_DURATION)),
    repeatMode: data.introRepeatMode === "every_visit" ? "every_visit" : "once",
    skipEnabled: data.introSkipEnabled ?? true,
    revision: Math.max(1, Number(data.introRevision) || 1),
  };
}

export function PortalIntro() {
  // Keep the server-rendered first frame deterministic; the configured/random
  // variation is selected once the client has loaded the welcome settings.
  const [variation, setVariation] = useState<IntroVariation>(VARIATIONS[0]);
  // Start visible on the first paint. This covers the portal's async workspace
  // fallback so visitors see the selected introduction instead of a brief logo-only screen.
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Initializing School Portal...");
  const [skipEnabled, setSkipEnabled] = useState(true);
  const [storageKey, setStorageKey] = useState(`${INTRO_SEEN_KEY}-${DEFAULT_CONFIG.revision}`);
  const dismissedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let frame = 0;
    let timer = 0;

    const begin = (config: IntroConfig) => {
      if (cancelled || dismissedRef.current) return;
      const key = `${INTRO_SEEN_KEY}-${config.revision}`;
      if (!config.enabled || (config.repeatMode === "once" && hasSeenIntro(key))) {
        setVisible(false);
        return;
      }

      const chosen = selectedVariation(config.variation);
      const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 900 : config.durationMs;
      const startedAt = performance.now();
      const messages = [
        [0, "Initializing School Portal..."],
        [34, "Preparing Your Login Environment..."],
        [72, "Aligning the school day..."],
        [96, "Loading Complete."],
      ] as const;

      setVariation(chosen);
      setStorageKey(key);
      setSkipEnabled(config.skipEnabled);
      setVisible(true);

      const tick = (now: number) => {
        const nextProgress = Math.min(100, ((now - startedAt) / duration) * 100);
        setProgress(nextProgress);
        const nextMessage = [...messages].reverse().find(([threshold]) => nextProgress >= threshold)?.[1];
        if (nextMessage) setMessage(nextMessage);
        if (nextProgress < 100 && !cancelled) frame = requestAnimationFrame(tick);
      };

      frame = requestAnimationFrame(tick);
      timer = window.setTimeout(() => {
        rememberIntro(key);
        setVisible(false);
      }, duration + 180);
    };

    getWelcomePage().then((data) => begin(normalizeConfig(data))).catch(() => begin(DEFAULT_CONFIG));
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, []);

  function continueToLogin() {
    dismissedRef.current = true;
    rememberIntro(storageKey);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="portal-intro" data-variation={variation.id} role="dialog" aria-modal="true" aria-label="Loading Kiwanja Ndege JSS portal">
      <div className="portal-intro-stars" aria-hidden="true">
        {Array.from({ length: 16 }, (_, index) => <i key={index} style={{
          "--star-index": index,
          "--star-top": `${(index * 37 + 9) % 100}%`,
          "--star-left": `${(index * 61 + 4) % 100}%`,
          "--star-size": `${0.12 + (index % 3) * 0.1}rem`,
          "--star-duration": `${1.7 + index * 0.11}s`,
          "--star-delay": `${index * -0.14}s`,
        } as React.CSSProperties} />)}
      </div>
      <div className="portal-intro-orbit portal-intro-orbit-one" aria-hidden="true" />
      <div className="portal-intro-orbit portal-intro-orbit-two" aria-hidden="true" />
      <div className="portal-intro-beams" aria-hidden="true" />
      <div className="portal-intro-content">
        <p className="portal-intro-kicker">KIWANJA NDEGE PORTAL</p>
        <div className="portal-intro-monogram" aria-label="KNJ">
          <span className="portal-intro-monogram-glow" aria-hidden="true" />
          <strong>KNJ</strong>
        </div>
        <p className="portal-intro-school-name">KIWANJA NDEGE JUNIOR SECONDARY SCHOOL</p>
        <p className="portal-intro-motto">ARISE AND SHINE <span>—</span> THE SKY IS THE LIMIT.</p>
        <p className="portal-intro-welcome">WELCOME TO KIWANJA NDEGE JSS</p>
        <div className="portal-intro-progress-wrap" aria-live="polite">
          <div className="portal-intro-progress-track"><span style={{ width: `${progress}%` }} /></div>
          <div className="portal-intro-progress-meta"><span>{message}</span><span>{Math.round(progress)}%</span></div>
        </div>
        {skipEnabled ? <button type="button" className="portal-intro-skip" onClick={continueToLogin}>Continue to login</button> : null}
        <p className="portal-intro-variation">{variation.name} introduction</p>
      </div>
    </div>
  );
}
