const SECRET_PATTERN = /(sk_[a-zA-Z0-9_]+|apiKey["']?\s*:\s*["'][^"']+["']|Bearer\s+[A-Za-z0-9._-]+)/g;

export function maskSecretsInText(value: string) {
  return value.replace(SECRET_PATTERN, (match) => {
    if (match.startsWith("sk_")) return "sk_••••••••••••";
    if (match.startsWith("Bearer")) return "Bearer ••••••••";
    return 'apiKey: "••••••••"';
  });
}
