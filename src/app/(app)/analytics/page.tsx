"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiRequestError, analyticsApi } from "@/lib/api";
import { toastFromError } from "@/lib/toast";
import type { TeacherAnalytics } from "@/lib/types";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { StatStrip } from "@/components/ui/stat-strip";
import { StatusBadge, statusToneFor } from "@/components/ui/status-badge";

function formatPercent(value: number | null) {
  if (value == null) return "None";
  return `${value}%`;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<TeacherAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "TEACHER") {
      router.replace("/dashboard");
      return;
    }
    analyticsApi
      .teacher()
      .then(setData)
      .catch((err) => {
        setError(
          err instanceof ApiRequestError
            ? err.message
            : "Could not load analytics",
        );
        toastFromError(err, "Could not load analytics");
      })
      .finally(() => setLoading(false));
  }, [user, router]);

  if (!user || user.role !== "TEACHER") {
    return <PageLoading label="Loading…" />;
  }

  if (loading) {
    return <PageLoading label="Loading analytics…" />;
  }

  if (error || !data) {
    return (
      <p
        className="border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
        role="alert"
      >
        {error ?? "Could not load analytics"}
      </p>
    );
  }

  const overview = data.overview;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        eyebrow="Teaching"
        title="Analytics"
        description="Submission rates, grading progress, and class performance."
      />

      <StatStrip
        items={[
          {
            label: "Published",
            value: overview.assignmentsPublished,
          },
          {
            label: "Submissions",
            value: overview.submissionsReceived,
          },
          {
            label: "To grade",
            value: overview.pendingGrading,
          },
          {
            label: "Avg score",
            value: formatPercent(overview.averageScorePercent),
          },
        ]}
      />

      <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
        <div className="bg-card px-5 py-4">
          <p className="text-[11px] font-medium tracking-[0.04em] text-muted-foreground uppercase">
            On time rate
          </p>
          <p className="mt-2 font-mono text-[1.35rem] font-semibold text-ink">
            {formatPercent(overview.onTimeRatePercent)}
          </p>
        </div>
        <div className="bg-card px-5 py-4">
          <p className="text-[11px] font-medium tracking-[0.04em] text-muted-foreground uppercase">
            Late rate
          </p>
          <p className="mt-2 font-mono text-[1.35rem] font-semibold text-ink">
            {formatPercent(overview.lateRatePercent)}
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">By class</h2>
        {data.perClass.length === 0 ? (
          <EmptyState
            title="No classes yet"
            description="Assign yourself to a class to see analytics here."
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-muted/40 text-[11px] tracking-[0.04em] text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Class</th>
                  <th className="px-4 py-2.5 font-medium">Students</th>
                  <th className="px-4 py-2.5 font-medium">Assignments</th>
                  <th className="px-4 py-2.5 font-medium">Submit rate</th>
                  <th className="px-4 py-2.5 font-medium">Avg score</th>
                  <th className="px-4 py-2.5 font-medium">To grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {data.perClass.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3">
                      <Link
                        href={`/classes/${row.id}`}
                        className="font-medium text-ink hover:underline"
                      >
                        {row.name}
                      </Link>
                      {row.subject && (
                        <p className="mt-0.5 text-[12px] text-muted-foreground">
                          {row.subject.name}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{row.studentCount}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {row.assignmentCount}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {formatPercent(row.submissionRatePercent)}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {formatPercent(row.averageScorePercent)}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {row.pendingGrading}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">Recent assignments</h2>
        {data.recentAssignments.length === 0 ? (
          <p className="border border-dashed border-border px-4 py-8 text-center text-[13px] text-muted-foreground">
            No assignments yet.
          </p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
            {data.recentAssignments.map((row) => (
              <li key={row.id} className="px-4 py-3.5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/assignments/${row.id}`}
                      className="text-sm font-medium text-ink hover:underline"
                    >
                      {row.title}
                    </Link>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">
                      {row.class.name}
                      {" · "}
                      {row.submittedCount}/{row.studentCount} submitted
                      {" · "}
                      Avg {formatPercent(row.averageScorePercent)}
                      {row.overdueUnsubmitted > 0
                        ? ` · ${row.overdueUnsubmitted} overdue missing`
                        : ""}
                    </p>
                  </div>
                  <StatusBadge tone={statusToneFor(row.status)}>
                    {row.status.charAt(0) + row.status.slice(1).toLowerCase()}
                  </StatusBadge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
