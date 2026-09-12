"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandMark, Wordmark } from "@/components/BrandMark";

const LINKS = [
  { href: "/#how-it-works", label: "How it works", id: "how-it-works" },
  { href: "/#threat-reports", label: "Threat reports", id: "threat-reports" },
  { href: "/#safety", label: "Safety", id: "safety" },
  { href: "/#demo", label: "Demo", id: "demo" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = LINKS.map((link) => link.id);
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-35% 0px -50% 0px", threshold: [0.15, 0.4] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors ${
        scrolled ? "border-b border-line bg-bg/80 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4" aria-label="Primary">
        <Link href="/" className="flex items-center gap-2 text-ink">
          <BrandMark className="h-7 w-7 text-ink" />
          <Wordmark className="text-sm font-semibold" />
        </Link>

        <ul className="hidden items-center gap-7 text-sm text-muted md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                aria-current={active === link.id ? "location" : undefined}
                className={active === link.id ? "text-ink" : "hover:text-ink"}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            href="/tool?demo=true"
            data-cursor="open"
            className="hidden rounded-full bg-lime px-4 py-2 text-sm font-semibold text-bg md:inline-flex"
          >
            Open tool →
          </Link>
          <button
            type="button"
            className="rounded-full border border-line px-3 py-2 text-sm text-ink md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </nav>

      {open ? (
        <div id="mobile-nav" className="border-t border-line bg-bg/95 px-5 py-4 md:hidden">
          <ul className="flex flex-col gap-4 text-sm">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link href="/tool?demo=true" className="font-semibold text-lime" onClick={() => setOpen(false)}>
                Open tool →
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}
