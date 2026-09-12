"use client";

import Link from "next/link";
import { SiteLogo } from "@/components/SiteLogo";

type ToolNavbarProps = {
  onNewScan: () => void;
};

export function ToolNavbar({ onNewScan }: ToolNavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/50 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center" aria-label="C0RTEX home">
          <SiteLogo className="h-12 w-auto md:h-16" />
        </Link>
        <p className="nav-link hidden md:block">Authorized analysis</p>
        <div className="flex items-center gap-2">
          <Link href="/" className="btn-ghost px-3 py-2 text-sm font-bold">
            Overview
          </Link>
          <button type="button" onClick={onNewScan} className="btn-primary px-3 py-2 text-sm font-bold">
            New scan
          </button>
        </div>
      </div>
    </header>
  );
}
