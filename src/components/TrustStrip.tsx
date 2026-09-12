"use client";

import { Marquee } from "@/components/motion/Marquee";

const ITEMS = [
  { title: "Authorized only", body: "Scan code you own or have permission to test." },
  { title: "Static-first", body: "Start from code, context, and evidence." },
  { title: "Human review", body: "Generated patches stay reviewable suggestions." },
  { title: "Transparent", body: "Every finding includes evidence and limits." },
] as const;

function TickerContent() {
  return (
    <>
      {ITEMS.map((item) => (
        <span key={item.title} className="flex items-center gap-3 whitespace-nowrap px-8">
          <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" />
          <span className="text-sm font-semibold text-ink">{item.title}</span>
          <span className="text-sm text-muted">{item.body}</span>
        </span>
      ))}
    </>
  );
}

export function TrustStrip() {
  return (
    <section className="border-y border-line py-5">
      <ul className="sr-only">
        {ITEMS.map((item) => (
          <li key={item.title}>
            {item.title}: {item.body}
          </li>
        ))}
      </ul>
      <Marquee speed={32} className="py-1">
        <div className="flex items-center">
          <TickerContent />
          <TickerContent />
        </div>
      </Marquee>
    </section>
  );
}
