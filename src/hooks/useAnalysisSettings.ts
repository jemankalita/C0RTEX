"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchPublicSettings } from "@/lib/settingsClient";
import type { PublicSettings } from "@/types/settings";

export function useAnalysisSettings() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchPublicSettings();
      setSettings(next);
    } catch (cause) {
      setSettings(null);
      setError(cause instanceof Error ? cause.message : "Could not read analysis settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { settings, error, loading, refresh };
}
