"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiRequestError, dashboardApi } from "@/lib/api";
import type { Dashboard } from "@/lib/types";

/**
 * Loads role-specific dashboard payload from the Nest backend
 * (`GET /api/v1/dashboard`). Backend chooses the shape from JWT role.
 */
export function useDashboard() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await dashboardApi.get();
      setData(next);
    } catch (err) {
      setData(null);
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Failed to load dashboard",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, error, loading, reload };
}
