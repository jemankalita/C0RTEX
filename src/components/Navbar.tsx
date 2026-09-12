"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteLogo } from "@/components/SiteLogo";

const LINKS = [
  { href: "/#how-it-works", label: "How it works", id: "how-it-works" },
  { href: "/#threat-reports", label: "Reports", id: "threat-reports" },
  { href: "/#safety", label: "Safety", id: "safety" },
  { href: "/#demo", label: "Demo", id: "demo" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 ${
        scrolled
          ? "border-b border-line bg-bg/60 backdrop-blur-xl"
          : "bg-gradient-to-b from-black/80 via-black/30 to-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3" aria-label="Primary">
        <Link href="/" className="flex min-w-0 items-center" aria-label="C0RTEX home">
          <SiteLogo className="h-14 w-auto sm:h-16 md:h-20" />
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="nav-link hover:text-lime">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex shrink-0 items-center gap-3">
          <Link href="/tool?demo=true" className="btn-primary hidden whitespace-nowrap md:inline-flex">
            Start now
          </Link>
          <button
            type="button"
            className="btn-ghost px-3 py-2 text-sm font-bold md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </nav>

      {open ? (
        <div id="mobile-nav" className="border-t border-line bg-bg/90 px-5 py-4 backdrop-blur-xl md:hidden">
          <ul className="flex flex-col gap-4">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="nav-link" onClick={() => setOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link href="/tool?demo=true" className="nav-link text-lime" onClick={() => setOpen(false)}>
                Start now
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}
