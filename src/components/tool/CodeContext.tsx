"use client";

import { useState } from "react";
import { highlightTerms } from "@/lib/highlightTerms";
import type { SecurityFinding } from "@/types/security";

export function CodeContext({ finding }: { finding: SecurityFinding }) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showFile, setShowFile] = useState(false);
  const [showTest, setShowTest] = useState(false);

  const notify = async (message: string, copyText?: string) => {
    if (copyText && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(copyText);
      } catch {
        setFeedback("Clipboard is unavailable in this browser.");
        return;
      }
    }
    setFeedback(message);
  };

  const masked = finding.codeBefore.replace(
    /sk_demo_not_a_real_secret_123/g,
    "sk_demo_••••••••••••",
  );
  const pieces = highlightTerms(masked, finding.highlightTerms);

  return (
    <section className="panel overflow-hidden rounded-2xl p-5">
      <p className="label">Code context</p>
      <p className="mt-2 font-mono text-xs text-cyan">
        {finding.file}:{finding.line}
      </p>
      <pre className="mt-3 overflow-x-auto rounded-xl bg-bg p-4 font-mono text-xs leading-6">
        <code>
          {pieces.map((piece, index) =>
            piece.marked ? (
              <mark key={`${piece.text}-${index}`} className="rounded bg-amber/20 text-amber">
                {piece.text}
              </mark>
            ) : (
              <span key={`${piece.text}-${index}`}>{piece.text}</span>
            ),
          )}
        </code>
      </pre>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => notify("Code copied.", finding.codeBefore)}
          className="rounded-full border border-line px-3 py-2 text-sm"
        >
          Copy code
        </button>
        <button
          type="button"
          onClick={() => {
            setShowFile((value) => !value);
            notify(`Opened file context for ${finding.file}.`);
          }}
          className="rounded-full border border-line px-3 py-2 text-sm"
        >
          Open file context
        </button>
        <button
          type="button"
          onClick={() => {
            setShowTest((value) => !value);
            notify(finding.relatedTestExcerpt ?? "No related test in this demo context.");
          }}
          className="rounded-full border border-line px-3 py-2 text-sm"
        >
          View related test
        </button>
      </div>
      {showFile ? (
        <p className="mt-3 rounded-xl border border-line bg-bg/60 p-3 font-mono text-xs text-muted">
          Demo file context: {finding.file}. This MVP shows the relevant excerpt only.
        </p>
      ) : null}
      {showTest && finding.relatedTestExcerpt ? (
        <pre className="mt-3 overflow-x-auto rounded-xl bg-bg p-3 font-mono text-xs text-muted">
          <code>{finding.relatedTestExcerpt}</code>
        </pre>
      ) : null}
      {feedback ? (
        <p className="mt-3 text-sm text-lime" aria-live="polite">
          {feedback}
        </p>
      ) : null}
    </section>
  );
}
