import Link from "next/link";
import { BrandMark, Wordmark } from "@/components/BrandMark";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 md:flex-row md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BrandMark className="h-6 w-6" />
            <Wordmark className="text-sm font-semibold" />
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted">
            Think like an attacker. Fix like an engineer.
          </p>
        </div>
        <ul className="flex flex-col gap-3 text-sm text-muted">
          <li><a href="/#how-it-works">How it works</a></li>
          <li><a href="/#threat-reports">Threat reports</a></li>
          <li><a href="/#safety">Safety</a></li>
          <li>
            <Link href="/tool?demo=true" className="text-lime">
              Open tool
            </Link>
          </li>
        </ul>
      </div>
      <p className="mx-auto max-w-6xl px-5 pb-10 text-xs leading-6 text-muted">
        C0RTEX is a developer security-analysis prototype. It does not guarantee
        that an application is secure. Only scan code and systems you are
        authorized to test.
      </p>
    </footer>
  );
}
