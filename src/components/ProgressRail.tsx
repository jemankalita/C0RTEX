"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "problem", label: "start" },
  { id: "demo", label: "02" },
  { id: "how-it-works", label: "03" },
  { id: "threat-reports", label: "04" },
  { id: "safety", label: "05" },
] as const;

/**
 * Fixed right-edge rail that lights up the section currently in view —
 * the vertical "start · 02 · 03 · 04 · 05" indicator from the reference.
 */
export function ProgressRail() {
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    // Scrollspy: the active section is the last one whose top sits above
    // the viewport's focus line (40%). Works for sections of any height,
    // and updates immediately on anchor navigation (hashchange).
    const compute = () => {
      const focusLine = window.innerHeight * 0.4;
      let current: string = SECTIONS[0].id;
      for (const { id } of SECTIONS) {
        const node = document.getElementById(id);
        if (!node) continue;
        if (node.getBoundingClientRect().top <= focusLine) current = id;
      }
      setActiveId(current);
    };

    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    window.addEventListener("hashchange", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
      window.removeEventListener("hashchange", compute);
    };
  }, []);

  return (
    <nav className="progress-rail" aria-label="Section progress">
      <ul>
        {SECTIONS.map(({ id, label }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className="progress-dot"
              data-active={activeId === id}
              aria-current={activeId === id ? "true" : undefined}
            >
              <span className="progress-dot-label">{label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
