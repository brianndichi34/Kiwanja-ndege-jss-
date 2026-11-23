import type { ReactNode } from "react";
import type { Workspace } from "@/lib/school/model";

export type Gate = {
  ws: Workspace;
  refresh: () => Promise<void>;
  flash: (message: string, bad?: boolean) => void;
  onWelcomeChange?: (settings: { enabled: boolean; url: string }) => void;
};

export function errText(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === "object") {
    const value = error as { message?: unknown; error?: { message?: unknown }; data?: { message?: unknown } };
    if (typeof value.message === "string" && value.message) return value.message;
    if (typeof value.error?.message === "string" && value.error.message) return value.error.message;
    if (typeof value.data?.message === "string" && value.data.message) return value.data.message;
  }
  return "The request could not be completed. Please check your details and try again.";
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "h-11 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-info";

export const btnClass =
  "inline-flex h-11 items-center justify-center rounded-md bg-navy px-4 text-sm font-semibold text-paper disabled:opacity-50";

export const btnGhost =
  "inline-flex h-11 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-semibold text-ink";
