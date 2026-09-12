import { Suspense } from "react";
import { ToolPage } from "@/components/tool/ToolPage";

export default function ToolRoutePage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted">Loading analyzer…</div>}>
      <ToolPage />
    </Suspense>
  );
}
