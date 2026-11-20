import { useEffect, useMemo, useState } from "react";

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

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function hasSeenIntro() {
  if (!canUseStorage()) return false;
  try {
    return window.localStorage.getItem(INTRO_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberIntro() {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    // Private browsing or blocked storage should never block the login page.
  }
}

export function PortalIntro() {
  const variation = useMemo<IntroVariation>(() => {
    const index = Math.floor(Math.random() * VARIATIONS.length);
    return VARIATIONS[index] ?? VARIATIONS[0];
  }, []);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Initializing School Portal...");

  useEffect(() => {
    if (hasSeenIntro()) return;

    setVisible(true);
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 900 : INTRO_DURATION;
    const startedAt = performance.now();
    let frame = 0;
    const messages = [
      [0, "Initializing School Portal..."],
      [34, "Preparing Your Login Environment..."],
      [72, "Aligning the school day..."],
      [96, "Loading Complete."],
    ] as const;

    const tick = (now: number) => {
      const nextProgress = Math.min(100, ((now - startedAt) / duration) * 100);
      setProgress(nextProgress);
      const nextMessage = [...messages].reverse().find(([threshold]) => nextProgress >= threshold)?.[1];
      if (nextMessage) setMessage(nextMessage);
      if (nextProgress < 100) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    const timer = window.setTimeout(() => {
      rememberIntro();
      setVisible(false);
    }, duration + 180);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, []);

  function continueToLogin() {
    rememberIntro();
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
        <p className="portal-intro-kicker">KIWANJA NDEGE JSS MARKS PORTAL</p>
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
        <button type="button" className="portal-intro-skip" onClick={continueToLogin}>Continue to login</button>
        <p className="portal-intro-variation">{variation.name} introduction</p>
      </div>
    </div>
  );
}
