import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden">
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-25"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-bg/80" />
      <div className="relative mx-auto max-w-6xl px-5 py-24 text-center">
        <p className="text-[11px] uppercase tracking-[0.28em] text-cyan">Ready to see the path?</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
          Find the weakness before it reaches production.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted">
          Scan an authorized codebase, understand the risk, and make your next release safer.
        </p>
        <Link
          href="/tool?demo=true"
          data-cursor="open"
          className="mt-8 inline-flex rounded-full bg-lime px-6 py-3 text-sm font-semibold text-bg"
        >
          Open C0RTEX →
        </Link>
        <p className="mt-4 text-xs text-muted">Start with the included vulnerable demo.</p>
      </div>
    </section>
  );
}
