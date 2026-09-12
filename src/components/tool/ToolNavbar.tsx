"use client";

import Link from "next/link";
import { useState } from "react";
import { NavPill } from "@/components/NavChrome";
import { SiteLogo } from "@/components/SiteLogo";
import { ToolSettings } from "@/components/tool/ToolSettings";
import { useAnalysisSettings } from "@/hooks/useAnalysisSettings";

type ToolNavbarProps = {
  onNewScan: () => void;
};

export function ToolNavbar({ onNewScan }: ToolNavbarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const analysis = useAnalysisSettings();
  const live = analysis.settings?.liveEnabled === true;

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/50 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-2.5 md:px-6">
        <Link href="/" className="flex min-w-0 items-center" aria-label="C0RTEX home">
          <SiteLogo className="h-9 w-auto sm:h-10" />
        </Link>
        <p className="pixel-heading text-xl font-bold text-white sm:text-2xl md:text-3xl">ANALYSIS</p>
        <div className="flex items-center gap-2">
          <NavPill className="inline-flex">
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="pixel-heading inline-flex items-center gap-2 rounded-full px-2.5 py-1.5 text-[10px] font-bold leading-none tracking-wide text-white hover:text-lime sm:text-[11px]"
              aria-haspopup="dialog"
              aria-expanded={settingsOpen}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  analysis.loading ? "bg-amber" : live ? "bg-lime" : "bg-threat"
                }`}
                aria-hidden="true"
              />
              Settings
            </button>
          </NavPill>
          <button
            type="button"
            onClick={onNewScan}
            className="btn-primary pixel-heading px-3 py-1.5 text-[10px] font-bold leading-none tracking-wide sm:text-[11px]"
          >
            New scan →
          </button>
        </div>
      </div>
      <ToolSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={analysis.settings}
        loading={analysis.loading}
        error={analysis.error}
        onRefresh={() => {
          void analysis.refresh();
        }}
      />
    </header>
  );
}
