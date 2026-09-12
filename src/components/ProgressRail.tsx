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
    const observer = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (top) setActiveId(top.target.id);
      },
      { threshold: [0.2, 0.5], rootMargin: "-30% 0px -30% 0px" },
    );
    SECTIONS.forEach(({ id }) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
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
