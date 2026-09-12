import type { ScanErrorKind } from "@/types/security";

export const ERROR_MESSAGES: Record<ScanErrorKind, string> = {
  unsupported_type: "C0RTEX currently supports JavaScript and TypeScript repositories in this demo.",
  too_large: "This MVP is optimized for small repositories. Try the included demo repository.",
  scan_failure: "The scan could not complete. Retry the scan or use the built-in demo.",
  missing_context:
    "The pattern was detected, but the available context is insufficient to determine practical exploitability.",
  patch_failure:
    "The suggested patch could not be applied cleanly to the scan working copy. Save the generated code and review it locally.",
};
