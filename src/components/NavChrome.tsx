import type { ReactNode } from "react";

export const SITE_LOGO_CLASS = "h-14 w-auto sm:h-16 md:h-20";

export function NavPill({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`items-center gap-1 rounded-full border border-white/18 bg-white/10 px-2 py-1 backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

export function navItemClass() {
  return "nav-link rounded-full px-3 py-2 hover:text-lime";
}
