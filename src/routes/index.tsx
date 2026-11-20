import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SchoolLogo } from "@/components/school/logo";
import { PublicReport } from "@/components/school/public-report";
import { btnClass, errText, inputClass } from "@/components/school/gate";
import { getWorkspace, getWelcomePage, login, portalStatus } from "@/lib/school/api";
import { applyDisplayPreferences, DEFAULT_DISPLAY_PREFERENCES, DISPLAY_PALETTES, readDisplayPreferences, saveDisplayPreferences, type LocalDisplayPreferences } from "@/lib/school/display";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => {
    const code = typeof search.c === "string" ? search.c.trim().toLowerCase() : "";
    return { c: code || undefined };
  },
  component: GatePage,
});

function GatePage() {
  const { c } = Route.useSearch();
  if (c) return <PublicReport code={c} />;
  return <LoginPage />;
}

function LoginPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<{ needsSetup: boolean; schoolName: string; motto: string; poBox: string; location: string } | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [welcome, setWelcome] = useState<{ title: string; subtitle: string; announcement: string; contact: string; logoData?: string; backgroundStart?: string; backgroundEnd?: string; titleSize?: number; fontFamily?: string; animationStyle?: string; animated?: boolean; highlights?: string; certification?: string; footerText?: string; paragraphColoursEnabled?: boolean; paragraphColourInterval?: number } | null>(null);
  const [display, setDisplay] = useState<LocalDisplayPreferences>(DEFAULT_DISPLAY_PREFERENCES);
  const [paragraphColourTick, setParagraphColourTick] = useState(0);

  useEffect(() => {
    portalStatus().then(setStatus).catch(() => setStatus({ needsSetup: true, schoolName: "Kiwanja Ndege JSS", motto: "Hard Work Pays", poBox: "", location: "" }));
    getWelcomePage().then(setWelcome).catch(() => setWelcome(null));
    getWorkspace()
      .then(() => navigate({ to: "/portal", search: { view: "home" } }))
      .catch(() => undefined);
    const preferences = readDisplayPreferences();
    setDisplay(preferences);
    applyDisplayPreferences(preferences);
  }, [navigate]);

  useEffect(() => {
    if (welcome?.paragraphColoursEnabled === false) return;
    const interval = Math.max(2, Math.min(30, welcome?.paragraphColourInterval ?? 4)) * 1000;
    const timer = window.setInterval(() => setParagraphColourTick((tick) => tick + 1), interval);
    return () => window.clearInterval(timer);
  }, [welcome?.paragraphColoursEnabled, welcome?.paragraphColourInterval]);

  function paragraphColour(index: number, sectionOffset: number) {
    if (welcome?.paragraphColoursEnabled === false) return sectionOffset ? "rgba(255,255,255,.88)" : "rgba(255,255,255,.9)";
    const hue = (sectionOffset + index * 47 + paragraphColourTick * 31) % 360;
    return `hsl(${hue}, 72%, 86%)`;
  }

  function colouredLines(text: string, sectionOffset: number, fontSize?: string) {
    return text.split(/\r?\n/).map((line, lineIndex) => (
      <span key={`${sectionOffset}-${lineIndex}`} className="block transition-colors duration-1000" style={{ color: paragraphColour(lineIndex, sectionOffset), fontSize }}>
        {line || "\u00a0"}
      </span>
    ));
  }

  function cycleWelcomeColour() {
    const currentIndex = DISPLAY_PALETTES.findIndex((palette) => palette.id === display.theme);
    const next = DISPLAY_PALETTES[(currentIndex + 1 + DISPLAY_PALETTES.length) % DISPLAY_PALETTES.length];
    const nextPreferences = { ...display, theme: next.id };
    setDisplay(nextPreferences);
    saveDisplayPreferences(nextPreferences);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login({ data: { email, password } });
      navigate({ to: "/portal", search: { view: "home" } });
    } catch (reason) {
      setError(errText(reason));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="welcome-shell grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]" style={{ "--welcome-start": welcome?.backgroundStart || "#0e2a4a", "--welcome-end": welcome?.backgroundEnd || "#245b82", "--welcome-title-size": `${welcome?.titleSize || 48}px`, fontFamily: welcome?.fontFamily || "serif" } as React.CSSProperties}>
      <section className={`welcome-hero relative flex flex-col justify-between px-6 py-8 text-paper sm:px-12 ${welcome?.animated === false || welcome?.animationStyle === "none" ? "welcome-static" : `welcome-animated welcome-animation-${welcome?.animationStyle || "aurora"}`}`}>
        <div className="welcome-ribbon-field" aria-hidden="true"><span className="welcome-ribbon welcome-ribbon-one" /><span className="welcome-ribbon welcome-ribbon-two" /><span className="welcome-ribbon welcome-ribbon-three" /><span className="welcome-ribbon welcome-ribbon-four" /><span className="welcome-ribbon-orb welcome-ribbon-orb-one" /><span className="welcome-ribbon-orb welcome-ribbon-orb-two" /></div>
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
          <SchoolLogo src={welcome?.logoData || undefined} className="size-16" />
          <p className="welcome-eyebrow text-xs tracking-[0.22em] text-brass-soft">JUNIOR SECONDARY</p>
          </div>
          <button type="button" className="welcome-display-switch" onClick={cycleWelcomeColour} title="Tap once to change welcome colours" aria-label="Change welcome page colours">
            <span className="welcome-display-dot" aria-hidden="true" /> Change colours
          </button>
        </div>
        <div className="relative z-10 max-w-xl py-12">
          <h1 className="welcome-title mt-3 font-serif font-black leading-tight" aria-label={welcome?.title || status?.schoolName || "Kiwanja Ndege JSS"}>{Array.from(welcome?.title || status?.schoolName || "Kiwanja Ndege JSS").map((letter, index) => <span key={`${letter}-${index}`} className={letter === " " ? "welcome-title-space" : "welcome-title-letter"} style={{ "--letter-index": index } as React.CSSProperties}>{letter === " " ? "\u00a0" : letter}</span>)}</h1>
          <p className="welcome-subtitle mt-3 text-sm font-semibold text-brass-soft">{welcome?.subtitle || "Exam portal for Grade 7, Grade 8 and Grade 9"}</p>
          <div className="welcome-heading-rule" aria-hidden="true"><span /><span /><span /></div>
          <div className="mt-5 max-w-md space-y-3" aria-labelledby="welcome-overview-heading">
            <h2 id="welcome-overview-heading" className="welcome-section-heading">A brighter school day starts here</h2>
            <div className="mt-4 max-w-md space-y-3">
            {(welcome?.announcement || "Marks, streams, merit lists and report cards stay in one office.").split(/\n\n+/).map((para, i) => (
              <p key={i} className="welcome-copy text-base" style={{ fontFamily: (welcome as any)?.fontFamily || "inherit" }}>{colouredLines(para, 40 + i * 17, welcome?.titleSize ? `${Math.max(14, Math.min(welcome.titleSize * 0.4, 22))}px` : undefined)}</p>
            ))}
            </div>
          </div>
          {welcome?.contact ? <p className="mt-4 whitespace-pre-wrap text-sm text-paper/80">{welcome.contact}</p> : null}
          {welcome?.highlights ? <div className="welcome-highlights mt-6 max-w-md space-y-2" aria-labelledby="welcome-highlights-heading"><h2 id="welcome-highlights-heading" className="welcome-section-heading">What your school office can see</h2>{welcome.highlights.split(/\n\n+/).map((para, i) => <p key={i} className="welcome-copy text-sm" style={{ fontFamily: (welcome as any)?.fontFamily || "inherit" }}>{colouredLines(para, 180 + i * 17)}</p>)}</div> : null}
          <p className="mt-8 font-serif text-lg text-brass-soft">Motto · {status?.motto || "Hard Work Pays"}</p>
          {status?.poBox ? <p className="mt-2 text-sm text-paper/70">P.O. Box {status.poBox}</p> : null}
          {welcome?.footerText ? <p className="mt-3 whitespace-pre-wrap text-xs text-paper/70">{welcome.footerText}</p> : null}
          <p className="mt-3 text-xs text-paper/70">{welcome?.certification || "© 2026 Certified"}</p>
        </div>
        <div className="relative z-10 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-paper/55"><span className="welcome-status-line" /><span>Secure school office</span></div>
      </section>
      <section className="welcome-login-panel flex items-center justify-center px-6 py-12">
        <form onSubmit={onSubmit} className="w-full max-w-sm">
          <h2 className="font-serif text-3xl text-navy">Sign in</h2>
          <p className="mt-2 text-sm text-muted">Use the email and password issued by the school. Super admins, admins, teachers, parents and students can all sign in here.</p>
          <label className="mt-8 block text-sm font-medium">
            Email
            <input className={`${inputClass} mt-1.5`} type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className="mt-4 block text-sm font-medium">
            Password
            <input className={`${inputClass} mt-1.5`} type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {error ? <p className="mt-4 text-sm text-bad">{error}</p> : null}
          <button className={`${btnClass} mt-6 w-full`} disabled={busy} type="submit">
            {busy ? "Signing in…" : "Sign in"}
          </button>
          {status?.needsSetup ? (
            <p className="mt-6 text-sm text-muted">
              First time for the school office?{" "}
              <Link to="/setup" className="font-semibold text-info">
                Create the super admin account
              </Link>
            </p>
          ) : null}
        </form>
      </section>
    </main>
  );
}
