"use client";

import { useEffect, useState } from "react";
import { classesApi, subjectsApi, usersApi } from "@/lib/api";
import type { SchoolSetupCounts } from "@/components/school/school-setup-guide";

export function useSchoolSetupCounts(enabled: boolean) {
  const [counts, setCounts] = useState<SchoolSetupCounts | null>(null);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all([
      subjectsApi.list(),
      classesApi.list(),
      usersApi.list({ role: "TEACHER" }),
    ])
      .then(([subjects, classes, teachers]) => {
        if (cancelled) return;
        setCounts({
          subjects: subjects.length,
          classes: classes.length,
          teachers: teachers.length,
        });
      })
      .catch(() => {
        if (!cancelled) setCounts(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { counts, loading };
}
