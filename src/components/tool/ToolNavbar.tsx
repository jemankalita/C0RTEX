"use client";

import Link from "next/link";
import { BrandMark, Wordmark } from "@/components/BrandMark";

type ToolNavbarProps = {
  onNewScan: () => void;
};

export function ToolNavbar({ onNewScan }: ToolNavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 font-semibold text-ink">
            <BrandMark className="h-7 w-7" />
            <Wordmark className="text-sm font-semibold" />
          </Link>
          <span className="hidden text-sm text-muted md:inline">Security Analyzer</span>
        </div>
        <p className="label hidden text-lime md:block">Authorized analysis</p>
        <div className="flex items-center gap-2">
          <Link href="/" className="rounded-full border border-line px-3 py-2 text-sm">
            Back to overview
          </Link>
          <a href="#safety-note" className="rounded-full border border-line px-3 py-2 text-sm">
            Safety note
          </a>
          <button
            type="button"
            onClick={onNewScan}
            className="rounded-full bg-lime px-3 py-2 text-sm font-semibold text-bg"
          >
            New scan
          </button>
        </div>
      </div>
    </header>
  );
}
