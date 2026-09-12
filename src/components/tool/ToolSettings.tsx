"use client";

import type { PublicSettings } from "@/types/settings";

type ToolSettingsProps = {
  open: boolean;
  onClose: () => void;
  settings: PublicSettings | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
};

export function ToolSettings({ open, onClose, settings, loading, error, onRefresh }: ToolSettingsProps) {
  if (!open) return null;

  const live = settings?.liveEnabled === true;

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-end bg-black/50 px-4 py-20 md:px-6" role="presentation">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close settings" onClick={onClose} />
      <section
        className="panel relative z-10 w-full max-w-md rounded-2xl p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tool-settings-title"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="label text-cyan">Settings</p>
            <h2 id="tool-settings-title" className="mt-2 text-xl font-semibold">
              Analysis connection
            </h2>
          </div>
          <button type="button" className="btn-ghost px-3 py-2 text-sm font-bold" onClick={onClose}>
            Close
          </button>
        </div>

        <div
          className={`mt-4 rounded-xl border px-4 py-3 ${
            live ? "border-lime/40 bg-lime/10" : "border-threat/40 bg-threat/10"
          }`}
        >
          <p className="flex items-center gap-2 text-sm font-semibold">
            <span className={`h-2.5 w-2.5 rounded-full ${live ? "bg-lime" : "bg-threat"}`} aria-hidden="true" />
            {loading ? "Checking API key…" : live ? "API key configured" : "API key missing"}
          </p>
          <p className={`mt-2 text-sm ${live ? "text-lime" : "text-threat"}`}>
            {loading
              ? "Reading server settings."
              : live
                ? "Live AI reasoning is available for this session."
                : "Scans will use demo analysis until a server key is added."}
          </p>
        </div>

        <dl className="mt-4 grid gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Mode</dt>
            <dd>{settings?.analysisMode ?? "unknown"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Provider</dt>
            <dd>{settings?.provider ?? "gemini"}</dd>
          </div>
        </dl>

        {error ? (
          <p className="mt-4 text-sm text-threat" role="alert">
            {error}
          </p>
        ) : null}

        <p className="mt-4 text-sm text-muted">
          Set <span className="font-mono text-ink">GEMINI_API_KEY</span> in{" "}
          <span className="font-mono text-ink">.env.local</span>. The key stays on the server and is never shown here.
        </p>

        <button type="button" className="btn-primary mt-5 px-3 py-2 text-sm font-bold" onClick={onRefresh}>
          Recheck connection
        </button>
      </section>
    </div>
  );
}
