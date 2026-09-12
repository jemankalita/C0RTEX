"use client";

import { useEffect, useRef, useState } from "react";

type CursorMode = "SCAN" | "OPEN TOOL" | "INSPECT" | "TRACE" | "MEASURE";

function labelForTarget(target: EventTarget | null): CursorMode {
  if (!(target instanceof Element)) return "SCAN";
  const labeled = target.closest("[data-cursor]");
  const value = labeled?.getAttribute("data-cursor");
  if (value === "open") return "OPEN TOOL";
  if (value === "inspect") return "INSPECT";
  if (value === "trace") return "TRACE";
  if (value === "measure") return "MEASURE";
  if (target.closest("a,button")) return "OPEN TOOL";
  return "SCAN";
}

export function CursorFollower() {
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<CursorMode>("SCAN");
  const [expanded, setExpanded] = useState(false);
  const [coords, setCoords] = useState({ x: -100, y: -100 });
  const current = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const wide = window.matchMedia("(min-width: 1024px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(fine.matches && wide.matches && !motion.matches);
    sync();
    fine.addEventListener("change", sync);
    wide.addEventListener("change", sync);
    motion.addEventListener("change", sync);
    return () => {
      fine.removeEventListener("change", sync);
      wide.removeEventListener("change", sync);
      motion.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    document.body.classList.add("cursor-desktop");

    let frame = 0;
    const onMove = (event: PointerEvent) => {
      target.current = { x: event.clientX, y: event.clientY };
      setLabel(labelForTarget(event.target));
      setExpanded(Boolean((event.target as Element | null)?.closest("a,button,[data-cursor]")));
    };

    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * 0.16;
      current.current.y += (target.current.y - current.current.y) * 0.16;
      setCoords({ x: current.current.x, y: current.current.y });
      frame = window.requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove);
    frame = window.requestAnimationFrame(tick);
    return () => {
      document.body.classList.remove("cursor-desktop");
      window.removeEventListener("pointermove", onMove);
      window.cancelAnimationFrame(frame);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[80] hidden lg:block" aria-hidden="true">
      <div
        className={`absolute h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border border-lime/70 ${
          expanded ? "scale-125" : "scale-100"
        }`}
        style={{ left: coords.x, top: coords.y }}
      />
      <div
        className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime"
        style={{ left: target.current.x, top: target.current.y }}
      />
      <div
        className="absolute -translate-y-1/2 text-[9px] font-medium uppercase tracking-[0.28em] text-lime"
        style={{ left: coords.x + 28, top: coords.y }}
      >
        {label}
      </div>
    </div>
  );
}
