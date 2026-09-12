export type PatchHint = {
  ruleId?: string;
  snippet?: string;
  codeBefore?: string;
  patch?: string;
  patchExplanation?: string;
};

export function suggestPatch(finding: PatchHint): { patch: string; patchExplanation: string } {
  if (finding.patch?.trim()) {
    return {
      patch: finding.patch,
      patchExplanation: finding.patchExplanation ?? "Review this minimal change before applying it.",
    };
  }

  const target = (finding.snippet || finding.codeBefore || "").trim();
  if (!target) {
    return {
      patch: "",
      patchExplanation: "No source snippet was available to draft a patch.",
    };
  }

  const replacement = replacementForRule(finding.ruleId, target);
  return {
    patch: `- ${target}\n+ ${replacement}`,
    patchExplanation: explanationForRule(finding.ruleId),
  };
}

function replacementForRule(ruleId: string | undefined, target: string) {
  switch (ruleId) {
    case "hardcoded-secret":
      return target.replace(/["']sk_[^"']+["']|["'][^"']{10,}["']/, "process.env.SERVICE_SECRET ?? \"\"");
    case "insecure-jwt":
      return target.replace(/["'][^"']*SECRET[^"']*["']/i, "process.env.JWT_SECRET ?? \"\"");
    case "sql-injection":
      return target.replace(/`([^`]*)\$\{([^}]+)\}([^`]*)`/, '"$1?" /* bind $2 */');
    case "command-injection":
      return target.replace(/`([^`]*)\$\{([^}]+)\}([^`]*)`/, "safeJoin(\"$1\", sanitize($2), \"$3\")");
    case "path-traversal":
      return target.replace(/`([^`]*)\$\{([^}]+)\}([^`]*)`/, "path.join(SAFE_DIR, path.basename($2))");
    case "unsafe-html":
      return target
        .replace("dangerouslySetInnerHTML", "children")
        .replace(/\.innerHTML\s*=/, ".textContent =");
    case "wildcard-cors":
      return target.replace('origin: "*"', "origin: ALLOWED_ORIGINS");
    case "open-redirect":
      return target.replace(/redirect\(([^)]+)\)/, "redirect(safeNext($1))");
    case "insecure-cookie":
      return target.replace("httpOnly: false", "httpOnly: true, secure: true, sameSite: \"lax\"");
    case "debug-env":
      return target.replace(/res\.json\([^)]*process\.env[^)]*\)/, "res.status(404).end()");
    case "missing-object-auth":
      return target.replace(
        /findById\(([^)]+)\)/,
        "findOne({ _id: $1, userId: req.user.id })",
      );
    case "ssrf":
      return target.replace(/fetch\(\s*([^)]+)\)/, "fetch(allowListedUrl($1))");
    case "mass-assignment":
      return target.replace(/req\.body/, "pick(req.body, ALLOWED_FIELDS)");
    case "auth-fallback":
      return target.replace(/req\.user = \{ id: "user-1" \}/, "return res.status(401).end()");
    default:
      return `${target}\n// TODO: review and constrain this untrusted input`;
  }
}

function explanationForRule(ruleId: string | undefined) {
  switch (ruleId) {
    case "hardcoded-secret":
    case "insecure-jwt":
      return "Load the secret from the environment so it is not committed in source.";
    case "sql-injection":
      return "Keep user input out of the SQL string and bind it as a parameter.";
    case "command-injection":
    case "path-traversal":
      return "Stop interpolating request data into a command or file path.";
    case "unsafe-html":
      return "Render untrusted content as text instead of HTML.";
    case "wildcard-cors":
      return "Allow only known origins instead of any site.";
    case "open-redirect":
      return "Allow redirects only to an approved destination.";
    case "insecure-cookie":
      return "Mark the session cookie HttpOnly, Secure, and SameSite=Lax.";
    case "debug-env":
      return "Remove the debug response that exposes environment values.";
    case "missing-object-auth":
      return "Require the authenticated user to own the requested record.";
    case "ssrf":
      return "Fetch only allow-listed URLs so users cannot steer server-side requests.";
    case "mass-assignment":
      return "Persist only an explicit allow-list of fields.";
    case "auth-fallback":
      return "Reject the request when verification fails instead of inventing a user.";
    default:
      return "Review this suggested change. It is a starting point, not a guaranteed fix.";
  }
}
