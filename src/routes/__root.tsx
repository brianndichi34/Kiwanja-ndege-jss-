import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { PortalIntro } from "@/components/school/portal-intro";
import { getWelcomePage } from "@/lib/school/api";
import { applyDisplayPreferences, readDisplayPreferences } from "@/lib/school/display";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Kiwanja Ndege Portal" },
      { name: "theme-color", content: "#0e2a4a" },
    ],
    links: [
      { rel: "icon", href: "/api/app-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,560;8..60,700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/api/app-manifest" },
      { rel: "apple-touch-icon", href: "/api/app-icon" },
    ],
  }),
  component: () => (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <AppearanceBootstrap />
        <PreviewHostBridge />
        <AuthProvider>
          <PortalIntro />
          <Outlet />
        </AuthProvider>
        <InstallPortalButton />
        <Scripts />
      </body>
    </html>
  ),
});


function AppearanceBootstrap() {
  useEffect(() => {
    const variables: Record<string, string> = {
      navy: "--color-navy", navy2: "--color-navy-2", brass: "--color-brass", brassSoft: "--color-brass-soft", paper: "--color-paper", card: "--color-card",
      ink: "--color-ink", muted: "--color-muted", line: "--color-line", good: "--color-good",
      warn: "--color-warn", bad: "--color-bad", info: "--color-info",
    };
    const apply = (colors: Record<string, unknown>) => {
      const saved: Record<string, string> = {};
      for (const [key, variable] of Object.entries(variables)) {
        const value = colors[key];
        if (typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value)) {
          document.documentElement.style.setProperty(variable, value);
          saved[key] = value;
        }
      }
      document.documentElement.dataset.schoolAppearance = JSON.stringify(saved);
    };
    applyDisplayPreferences(readDisplayPreferences());
    getWelcomePage().then((settings) => apply(settings.appearance || {})).catch(() => {
      try {
        const raw = localStorage.getItem("kiwanja-super-admin-appearance-v1");
        if (raw) apply(JSON.parse(raw) as Record<string, unknown>);
      } catch {
        // Invalid or unavailable browser storage should not prevent the portal from loading.
      }
    }).finally(() => applyDisplayPreferences(readDisplayPreferences()));
  }, []);
  return null;
}

function InstallPortalButton() {
  const [installEvent, setInstallEvent] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    const runningAsApp = window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    if (runningAsApp) return;
    const handler = (event: Event) => { event.preventDefault(); setInstallEvent(event); };
    window.addEventListener("beforeinstallprompt", handler);
    getWelcomePage().then((settings) => setAllowed(Boolean(settings.installPromptEnabled && (settings.installPromptForSuperAdmin || !settings.viewerIsSuperAdmin)))).catch(() => setAllowed(false));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  if (dismissed || !allowed) return null;
  async function install() {
    if (installEvent) {
      await installEvent.prompt();
      setInstallEvent(null);
      return;
    }
    setOpen(true);
  }
  return <>
    <button type="button" onClick={() => void install()} className="fixed bottom-4 right-4 z-[70] rounded-full border border-white/40 bg-navy px-4 py-2 text-xs font-bold text-white shadow-xl transition hover:-translate-y-0.5">Install Kiwanja Ndege app</button>
    {open ? <div className="fixed inset-0 z-[80] grid place-items-center bg-navy/50 px-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><div className="w-full max-w-md rounded-2xl border border-line bg-card p-5 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="install-portal-title"><h2 id="install-portal-title" className="font-serif text-2xl text-navy">Save Kiwanja Ndege Portal</h2><p className="mt-2 text-sm text-muted">Use your browser menu and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>. The portal will open like an app and use the school app logo.</p><a className="mt-4 inline-flex rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white" href="/api/app-manifest" target="_blank" rel="noreferrer">Open app manifest</a><button className="ml-2 rounded-lg border border-line px-4 py-2 text-sm" type="button" onClick={() => setOpen(false)}>Close</button></div></div> : null}
  </>;
}
