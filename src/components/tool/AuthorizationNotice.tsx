"use client";

import { motion } from "framer-motion";

type AuthorizationNoticeProps = {
  authorized: boolean;
  onChange: (value: boolean) => void;
  demoSelected: boolean;
};

export function AuthorizationNotice({
  authorized,
  onChange,
  demoSelected,
}: AuthorizationNoticeProps) {
  return (
    <motion.section
      initial={{ opacity: 0, x: -28 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="panel hud-panel rounded-2xl p-4"
    >
      <p className="label text-amber">Scan authorization</p>
      <p className="mt-2 text-sm text-muted">
        Only scan codebases you own or have permission to analyze. The demo runs on a local
        deliberately vulnerable application. For external repositories, verify authorization
        before scanning.
      </p>
      {demoSelected ? (
        <p className="mt-2 text-sm text-lime">This is a local built-in demo repository.</p>
      ) : null}
      <label className="mt-3 flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={authorized}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span>I confirm that I am authorized to analyze this codebase.</span>
      </label>
    </motion.section>
  );
}
