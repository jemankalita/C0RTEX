"use client";

import Link from "next/link";
import { useState } from "react";
import { NavPill, SITE_LOGO_CLASS, navItemClass } from "@/components/NavChrome";
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
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="flex min-w-0 items-center" aria-label="C0RTEX home">
          <SiteLogo className={SITE_LOGO_CLASS} />
        </Link>
        <NavPill className="hidden md:inline-flex">
          <p className={navItemClass()}>Authorized analysis</p>
          <Link href="/benchmark" className={navItemClass()}>
            Accuracy
          </Link>
          <Link href="/" className={navItemClass()}>
            Overview
          </Link>
        </NavPill>
        <div className="flex items-center gap-2">
          <NavPill className="inline-flex">
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className={`${navItemClass()} inline-flex items-center gap-2`}
              aria-haspopup="dialog"
              aria-expanded={settingsOpen}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  analysis.loading ? "bg-amber" : live ? "bg-lime" : "bg-threat"
                }`}
                aria-hidden="true"
              />
              Settings
            </button>
          </NavPill>
          <button type="button" onClick={onNewScan} className="btn-primary px-3 py-2 text-sm font-bold">
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
