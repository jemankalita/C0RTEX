"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CountUp } from "@/components/motion/CountUp";
import type { ScanSummary } from "@/types/security";

type ApplicationMapProps = {
  summary: ScanSummary;
  resolved: boolean;
};

const nodes = ["Routes", "Controllers", "Services", "Database/API"];

export function ApplicationMap({ summary, resolved }: ApplicationMapProps) {
  const reduced = useReducedMotion();

  return (
    <section className="panel hud-panel rounded-2xl p-5">
      <p className="label">Application attack surface</p>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
        <Metric label="Public routes" value={summary.publicRoutes} />
        <Metric label="Authenticated routes" value={summary.authenticatedRoutes} />
        <Metric label="Admin routes" value={summary.adminRoutes} />
        <Metric label="Database sinks" value={summary.databaseSinks} />
        <Metric label="External API calls" value={summary.externalApiCalls} />
        <Metric label="Sensitive operations" value={summary.sensitiveOperations} />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {nodes.map((node, index) => (
          <motion.div key={node} className="flex items-center gap-2" {...(reduced ? {} : {
            initial: { opacity: 0, x: -18 },
            whileInView: { opacity: 1, x: 0 },
            viewport: { once: true },
            transition: { duration: 0.5, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] },
          })}>
            <div
              className={`rounded-lg border px-3 py-2 font-mono text-xs transition-colors duration-700 ${
                resolved ? "border-lime text-lime" : index > 1 ? "border-threat text-threat" : "border-cyan text-cyan"
              }`}
            >
              {node}
            </div>
            {index < nodes.length - 1 ? (
              <motion.span
                className="text-muted"
                animate={reduced ? undefined : { opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.6, repeat: Infinity, delay: index * 0.3 }}
                aria-hidden
              >
                →
              </motion.span>
            ) : null}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-muted">{label}</p>
      <p className="text-lg font-semibold">
        <CountUp to={value} duration={1.2} />
      </p>
    </div>
  );
}
