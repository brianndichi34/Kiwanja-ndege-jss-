import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SchoolLogo } from "@/components/school/logo";
import { PublicReport } from "@/components/school/public-report";
import { btnClass, errText, inputClass } from "@/components/school/gate";
import { getWorkspace, getWelcomePage, login, loginAsParent, portalStatus } from "@/lib/school/api";
import { applyDisplayPreferences, DEFAULT_DISPLAY_PREFERENCES, DISPLAY_PALETTES, readDisplayPreferences, saveDisplayPreferences, type LocalDisplayPreferences } from "@/lib/school/display";
import { DEFAULT_WELCOME_DISPLAY, hexToRgba, normalizeWelcomeDisplay, type WelcomeDisplayOptions } from "@/lib/school/welcome-display";
import { ParentRegistration } from "@/components/school/parent-registration";

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
  const [parentMode, setParentMode] = useState(false);
  const [parentEmail, setParentEmail] = useState("");
  const [parentPassword, setParentPassword] = useState("");
  const [parentPasswordVisible, setParentPasswordVisible] = useState(false);
  const [parentHelp, setParentHelp] = useState<"account" | "reset" | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [welcome, setWelcome] = useState<{ title: string; subtitle: string; announcement: string; contact: string; logoData?: string; backgroundStart?: string; backgroundEnd?: string; backgroundMode?: string; backgroundEnabled?: boolean; rainbowSpeed?: number; titleSize?: number; fontFamily?: string; animationStyle?: string; animated?: boolean; highlights?: string; certification?: string; footerText?: string; paragraphColoursEnabled?: boolean; paragraphColourInterval?: number; display?: WelcomeDisplayOptions } | null>(null);
  const [display, setDisplay] = useState<LocalDisplayPreferences>(DEFAULT_DISPLAY_PREFERENCES);
  const [paragraphColourTick, setParagraphColourTick] = useState(0);
  const [backgroundColourTick, setBackgroundColourTick] = useState(0);

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

  useEffect(() => {
    if (!welcome || welcome.backgroundEnabled === false || welcome.backgroundMode !== "automatic") return;
    const timer = window.setInterval(() => setBackgroundColourTick((tick) => tick + 1), 4000);
    return () => window.clearInterval(timer);
  }, [welcome?.backgroundMode, welcome?.backgroundEnabled]);

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

  async function onParentSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await loginAsParent({ data: { email: parentEmail, password: parentPassword } });
      navigate({ to: "/portal", search: { view: "home" } });
    } catch (reason) {
      setError(errText(reason));
    } finally {
      setBusy(false);
    }
  }

  function showParentSignIn() {
    setParentMode(true);
    setError("");
    setParentHelp(null);
  }

  function showRegularSignIn() {
    setParentMode(false);
    setError("");
    setParentHelp(null);
  }

  const welcomeDisplay = normalizeWelcomeDisplay(welcome?.display || DEFAULT_WELCOME_DISPLAY);
  const backgroundPalettes = [["#0e2a4a", "#245b82"], ["#24104f", "#7b2cbf"], ["#064e3b", "#0f766e"], ["#7c2d12", "#be123c"], ["#172554", "#0369a1"]];
  const rainbowGradient = `linear-gradient(${welcomeDisplay.gradientAngle}deg, #ff1744 0%, #ff8f00 16%, #ffe600 32%, #20d66b 48%, #00b8ff 64%, #7048ff 82%, #e83e8c 100%)`;
  const backgroundIndex = welcome?.backgroundMode === "automatic" ? backgroundColourTick % backgroundPalettes.length : welcome?.backgroundMode === "random" ? Math.abs((welcome?.title || "Kiwanja").length * 17) % backgroundPalettes.length : 0;
  const selectedBackground = welcome?.backgroundMode === "specific" || !welcome?.backgroundMode ? [welcome?.backgroundStart || "#0e2a4a", welcome?.backgroundEnd || "#245b82"] : welcome?.backgroundMode === "rainbow" ? ["#ff1744", "#7048ff"] : backgroundPalettes[backgroundIndex];
  const welcomeBackgroundImage = welcome?.backgroundEnabled === false ? "none" : `${`linear-gradient(${welcomeDisplay.gradientAngle}deg, ${hexToRgba(welcomeDisplay.accentAltColor, 0.18)}, transparent 70%)`}, ${welcome?.backgroundMode === "rainbow" ? rainbowGradient : `linear-gradient(${welcomeDisplay.gradientAngle}deg, ${selectedBackground[0]}, ${selectedBackground[1]})`}`;
  const contentWidth = welcomeDisplay.contentWidth === "narrow" ? "28rem" : welcomeDisplay.contentWidth === "wide" ? "48rem" : "36rem";
  return (
    <main className="welcome-shell grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]" style={{ "--welcome-start": welcome?.backgroundStart || "#0e2a4a", "--welcome-end": welcome?.backgroundEnd || "#245b82", "--welcome-title-size": `${welcome?.titleSize || 48}px`, fontFamily: welcome?.fontFamily || "serif" } as React.CSSProperties}>
      <section className={`welcome-hero relative flex flex-col justify-between px-6 py-8 text-paper sm:px-12 ${welcome?.animated === false || welcome?.animationStyle === "none" ? "welcome-static" : `welcome-animated welcome-animation-${welcome?.animationStyle || "aurora"} ${welcome?.backgroundMode === "rainbow" ? "welcome-animation-rainbow" : ""}`}`} style={{ backgroundColor: selectedBackground[0], backgroundImage: welcomeBackgroundImage, "--welcome-rainbow-duration": `${welcome?.rainbowSpeed || 12}s` } as React.CSSProperties}>
        <div className={`welcome-ribbon-field ${welcomeDisplay.showRibbons ? "" : "hidden"}`} aria-hidden="true"><span className="welcome-ribbon welcome-ribbon-one" /><span className="welcome-ribbon welcome-ribbon-two" /><span className="welcome-ribbon welcome-ribbon-three" /><span className="welcome-ribbon welcome-ribbon-four" /><span className="welcome-ribbon-orb welcome-ribbon-orb-one" /><span className="welcome-ribbon-orb welcome-ribbon-orb-two" /></div>
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
          <SchoolLogo src={welcome?.logoData || undefined} className="size-16" />
          <p className="welcome-eyebrow text-xs tracking-[0.22em]" style={{ color: welcomeDisplay.eyebrowColor }}>JUNIOR SECONDARY</p>
          </div>
          <button type="button" className="welcome-display-switch" onClick={cycleWelcomeColour} title="Tap once to change welcome colours" aria-label="Change welcome page colours">
            <span className="welcome-display-dot" aria-hidden="true" /> Change colours
          </button>
        </div>
        <div className="relative z-10 py-12" style={{ maxWidth: contentWidth, marginInline: welcomeDisplay.contentAlignment === "center" ? "auto" : undefined, textAlign: welcomeDisplay.contentAlignment }}>
          <h1 className="welcome-title mt-3 font-serif font-black leading-tight" style={{ color: welcomeDisplay.titleColor, letterSpacing: `${welcomeDisplay.titleLetterSpacing}em`, textShadow: welcomeDisplay.titleShadow ? "0 3px 22px rgba(4,16,35,.42)" : "none" }} aria-label={welcome?.title || status?.schoolName || "Kiwanja Ndege JSS"}>{Array.from(welcome?.title || status?.schoolName || "Kiwanja Ndege JSS").map((letter, index) => <span key={`${letter}-${index}`} className={letter === " " ? "welcome-title-space" : "welcome-title-letter"} style={{ "--letter-index": index } as React.CSSProperties}>{letter === " " ? "\u00a0" : letter}</span>)}</h1>
          <p className="welcome-subtitle mt-3 text-sm font-semibold" style={{ color: welcomeDisplay.subtitleColor }}>{welcome?.subtitle || "Exam portal for Grade 7, Grade 8 and Grade 9"}</p>
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
      <section className="welcome-login-panel flex items-center justify-center px-6 py-12" style={{ backgroundColor: hexToRgba(welcomeDisplay.panelColor, welcomeDisplay.panelOpacity) }}>
        <form onSubmit={parentMode ? onParentSubmit : onSubmit} className="w-full max-w-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-3xl text-navy">{parentMode ? "Sign in as PARENTS" : "Sign in"}</h2>
            {parentMode ? <button type="button" className="text-xs font-semibold text-info underline underline-offset-4" onClick={showRegularSignIn}>Staff and student sign in</button> : null}
          </div>
          {parentMode ? (
            <>
              <p className="mt-2 text-sm text-muted">Use the verified email address and parent portal password issued by Kiwanja Ndege JSS.</p>
              <label className="mt-8 block text-sm font-medium">
                Your email address
                <input className={`${inputClass} mt-1.5`} type="email" autoComplete="username" value={parentEmail} onChange={(event) => setParentEmail(event.target.value)} required />
              </label>
              <label className="mt-4 block text-sm font-medium">
                Parent portal password
                <div className="relative mt-1.5">
                  <input className={`${inputClass} pr-20`} type={parentPasswordVisible ? "text" : "password"} autoComplete="current-password" value={parentPassword} onChange={(event) => setParentPassword(event.target.value)} required />
                  <button type="button" className="absolute inset-y-0 right-2 px-2 text-xs font-semibold text-info" onClick={() => setParentPasswordVisible((visible) => !visible)} aria-label={parentPasswordVisible ? "Hide parent portal password" : "Show parent portal password"}>
                    {parentPasswordVisible ? "Hide" : "Show"}
                  </button>
                </div>
              </label>
              {error ? <p className="mt-4 text-sm text-bad" role="alert">{error}</p> : null}
              <button className={`${btnClass} mt-6 w-full`} disabled={busy} type="submit">
                {busy ? "Signing in…" : "Sign in to parent portal"}
              </button>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <button type="button" className="text-left text-xs font-semibold text-info underline underline-offset-4" onClick={() => setParentHelp(parentHelp === "account" ? null : "account")}>Create a parent account</button>
                <button type="button" className="text-left text-xs font-semibold text-info underline underline-offset-4 sm:text-right" onClick={() => setParentHelp(parentHelp === "reset" ? null : "reset")}>Forgot or reset parent password?</button>
              </div>
              {parentHelp === "account" ? <ParentRegistration onDone={() => setParentHelp(null)} /> : parentHelp === "reset" ? <p className="mt-3 rounded-md border border-line bg-card px-3 py-3 text-xs leading-5 text-muted" role="note">For security, parent password resets are handled by the school office. Ask an administrator to reset your password, then sign in here with the new one.</p> : null}
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted">Use the email and password issued by the school. Super admins, admins, teachers, parents and students can all sign in here.</p>
              <label className="mt-8 block text-sm font-medium">
                Email
                <input className={`${inputClass} mt-1.5`} type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </label>
              <label className="mt-4 block text-sm font-medium">
                Password
                <input className={`${inputClass} mt-1.5`} type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
              </label>
              {error ? <p className="mt-4 text-sm text-bad" role="alert">{error}</p> : null}
              <button className={`${btnClass} mt-6 w-full`} disabled={busy} type="submit">
                {busy ? "Signing in…" : "Sign in"}
              </button>
              <button type="button" className="mt-3 w-full rounded-md border border-line bg-card px-4 py-3 text-sm font-semibold text-ink" onClick={showParentSignIn}>Sign in as PARENTS</button>
            </>
          )}
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
