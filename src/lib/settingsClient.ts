import type { PublicSettings } from "@/types/settings";

export async function fetchPublicSettings(): Promise<PublicSettings> {
  const response = await fetch("/api/settings", { cache: "no-store" });
  const payload = (await response.json()) as PublicSettings & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? "Could not read analysis settings.");
  }
  return payload;
}
