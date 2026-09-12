import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="px-5 py-28">
      <div className="mx-auto max-w-4xl text-center">
        <p className="bracket">[ ready ]</p>
        <h2 className="display mx-auto mt-4 max-w-3xl text-4xl leading-[1.02] sm:text-6xl">
          C0RTEX is building the path from suspicion to a verified fix.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[17px] leading-7 text-muted">
          Start with the included demo. See the attack path. Apply the patch. Recheck.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/tool?demo=true" className="btn-primary">
            Start now
          </Link>
          <a href="#how-it-works" className="btn-ghost">
            How it works
          </a>
        </div>
      </div>
    </section>
  );
}
