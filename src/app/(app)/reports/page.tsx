"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiRequestError, analyticsApi } from "@/lib/api";
import { toastFromError } from "@/lib/toast";
import type { PerformanceReport } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { StatStrip } from "@/components/ui/stat-strip";

function canViewReports(role: string | undefined) {
  return role === "TEACHER" || role === "SCHOOL_ADMIN" || role === "HEADMASTER";
}

function formatPercent(value: number | null) {
  if (value == null) return "None";
  return `${value}%`;
}

function formatPoints(current: number | null, earlier: number | null) {
  if (current == null || earlier == null) return "None";
  const delta = Math.round((current - earlier) * 10) / 10;
  if (delta > 0) return `+${delta}`;
  return String(delta);
}

function classroomHref(classId: string, searchParams: { toString(): string }) {
  const next = new URLSearchParams(searchParams.toString());
  next.set("classId", classId);
  return `/reports?${next.toString()}`;
}

function periodLabel(from: string | null, to: string | null, fallback: string) {
  if (!from && !to) return fallback;
  if (from && to) return `${from} to ${to}`;
  if (from) return `From ${from}`;
  return `Until ${to}`;
}

function ReportsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryKey = searchParams.toString();
  const [data, setData] = useState<PerformanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classId, setClassId] = useState(searchParams.get("classId") ?? "");
  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");
  const [compareFrom, setCompareFrom] = useState(
    searchParams.get("compareFrom") ?? "",
  );
  const [compareTo, setCompareTo] = useState(searchParams.get("compareTo") ?? "");

  useEffect(() => {
    if (!user) return;
    if (!canViewReports(user.role)) {
      router.replace("/dashboard");
      return;
    }
    setClassId(searchParams.get("classId") ?? "");
    setFrom(searchParams.get("from") ?? "");
    setTo(searchParams.get("to") ?? "");
    setCompareFrom(searchParams.get("compareFrom") ?? "");
    setCompareTo(searchParams.get("compareTo") ?? "");
    setLoading(true);
    setError(null);
    analyticsApi
      .report({
        classId: searchParams.get("classId") || undefined,
        from: searchParams.get("from") || undefined,
        to: searchParams.get("to") || undefined,
        compareFrom: searchParams.get("compareFrom") || undefined,
        compareTo: searchParams.get("compareTo") || undefined,
      })
      .then(setData)
      .catch((err) => {
        setData(null);
        setError(
          err instanceof ApiRequestError ? err.message : "Could not load reports",
        );
        toastFromError(err, "Could not load reports");
      })
      .finally(() => setLoading(false));
  }, [user, router, queryKey, searchParams]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next = new URLSearchParams();
    if (classId) next.set("classId", classId);
    if (from) next.set("from", from);
    if (to) next.set("to", to);
    if (compareFrom) next.set("compareFrom", compareFrom);
    if (compareTo) next.set("compareTo", compareTo);
    const qs = next.toString();
    router.replace(qs ? `/reports?${qs}` : "/reports");
  }

  if (!user || !canViewReports(user.role)) {
    return <PageLoading label="Loading…" />;
  }

  const selected = data?.rows.length === 1 && classId ? data.rows[0] : null;
  const comparing = Boolean(data?.compare);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        eyebrow="School"
        title="Reports"
        description={`Classroom performance and pass rates. A graded mark of ${data?.passMarkPercent ?? 50}% or higher counts as a pass. Periods follow the assignment due date.`}
      />

      <form
        onSubmit={onSubmit}
        className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
          <Label htmlFor="classId" className="text-[13px] text-zinc-600">
            Classroom
          </Label>
          <select
            id="classId"
            value={classId}
            onChange={(event) => setClassId(event.target.value)}
            className="h-9 w-full rounded-md border border-border bg-white px-2.5 text-sm"
          >
            <option value="">All classrooms</option>
            {(data?.classes ?? []).map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
                {room.subjectName ? ` · ${room.subjectName}` : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="from" className="text-[13px] text-zinc-600">
            Period start
          </Label>
          <Input
            id="from"
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="h-9 bg-white"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="to" className="text-[13px] text-zinc-600">
            Period end
          </Label>
          <Input
            id="to"
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="h-9 bg-white"
          />
        </div>
        <div className="hidden lg:block" />
        <div className="space-y-1.5">
          <Label htmlFor="compareFrom" className="text-[13px] text-zinc-600">
            Compare start
          </Label>
          <Input
            id="compareFrom"
            type="date"
            value={compareFrom}
            onChange={(event) => setCompareFrom(event.target.value)}
            className="h-9 bg-white"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="compareTo" className="text-[13px] text-zinc-600">
            Compare end
          </Label>
          <Input
            id="compareTo"
            type="date"
            value={compareTo}
            onChange={(event) => setCompareTo(event.target.value)}
            className="h-9 bg-white"
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" className="h-9">
            Show report
          </Button>
        </div>
      </form>

      {loading ? (
        <PageLoading label="Loading report…" />
      ) : error || !data ? (
        <p
          className="border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
          role="alert"
        >
          {error ?? "Could not load reports"}
        </p>
      ) : data.classes.length === 0 ? (
        <EmptyState
          title="No classrooms yet"
          description="Add a class before you can pull a performance report."
        />
      ) : selected ? (
        <ClassReport row={selected} comparing={comparing} report={data} />
      ) : (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-ink">
            {periodLabel(data.period.from, data.period.to, "All dates")}
            {data.compare
              ? ` compared with ${periodLabel(data.compare.from, data.compare.to, "the other period")}`
              : ""}
          </h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[720px] text-left text-[13px]">
              <thead className="bg-muted/40 text-[11px] tracking-[0.04em] text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Classroom</th>
                  <th className="px-4 py-2.5 font-medium">Students</th>
                  <th className="px-4 py-2.5 font-medium">Graded</th>
                  <th className="px-4 py-2.5 font-medium">Pass rate</th>
                  <th className="px-4 py-2.5 font-medium">Students passing</th>
                  <th className="px-4 py-2.5 font-medium">Average</th>
                  {comparing ? (
                    <>
                      <th className="px-4 py-2.5 font-medium">Earlier pass rate</th>
                      <th className="px-4 py-2.5 font-medium">Change</th>
                    </>
                  ) : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {data.rows.map((row) => (
                  <tr key={row.classId}>
                    <td className="px-4 py-3">
                      <Link
                        href={classroomHref(row.classId, searchParams)}
                        className="font-medium text-ink hover:underline"
                      >
                        {row.className}
                      </Link>
                      {row.subjectName ? (
                        <p className="mt-0.5 text-[12px] text-muted-foreground">
                          {row.subjectName}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{row.studentCount}</td>
                    <td className="px-4 py-3 tabular-nums">{row.period.graded}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {formatPercent(row.period.passRatePercent)}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {formatPercent(row.period.studentPassRatePercent)}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {formatPercent(row.period.averageScorePercent)}
                    </td>
                    {comparing ? (
                      <>
                        <td className="px-4 py-3 tabular-nums">
                          {formatPercent(row.compare?.passRatePercent ?? null)}
                        </td>
                        <td className="px-4 py-3 tabular-nums">
                          {formatPoints(
                            row.period.passRatePercent,
                            row.compare?.passRatePercent ?? null,
                          )}
                        </td>
                      </>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[12px] text-muted-foreground">
            Pass rate is graded marks at or above the pass mark, divided by graded marks. Students passing is the share of students whose average is at or above the pass mark. Ungraded work is left out.
          </p>
        </section>
      )}
    </div>
  );
}

function ClassReport({
  row,
  comparing,
  report,
}: {
  row: PerformanceReport["rows"][number];
  comparing: boolean;
  report: PerformanceReport;
}) {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">
            {row.className}
            {row.subjectName ? ` · ${row.subjectName}` : ""}
          </h2>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            {periodLabel(report.period.from, report.period.to, "All dates")}
            {" · "}
            <Link href={`/classes/${row.classId}`} className="hover:underline">
              Open classroom
            </Link>
          </p>
        </div>
        <StatStrip
          items={[
            { label: "Students", value: row.studentCount },
            { label: "Graded marks", value: row.period.graded },
            { label: "Pass rate", value: formatPercent(row.period.passRatePercent) },
            {
              label: "Students passing",
              value: formatPercent(row.period.studentPassRatePercent),
            },
            { label: "Average", value: formatPercent(row.period.averageScorePercent) },
          ]}
        />
      </section>

      {comparing && row.compare ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-ink">
            Compared with{" "}
            {periodLabel(report.compare?.from ?? null, report.compare?.to ?? null, "the other period")}
          </h2>
          <StatStrip
            items={[
              {
                label: "Earlier pass rate",
                value: formatPercent(row.compare.passRatePercent),
              },
              {
                label: "Change",
                value: formatPoints(
                  row.period.passRatePercent,
                  row.compare.passRatePercent,
                ),
              },
              {
                label: "Earlier average",
                value: formatPercent(row.compare.averageScorePercent),
              },
              {
                label: "Earlier students passing",
                value: formatPercent(row.compare.studentPassRatePercent),
              },
            ]}
          />
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">Students</h2>
        {(row.students ?? []).length === 0 ? (
          <EmptyState
            title="No students in this classroom"
            description="Enroll students to see their results here."
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[640px] text-left text-[13px]">
              <thead className="bg-muted/40 text-[11px] tracking-[0.04em] text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Student</th>
                  <th className="px-4 py-2.5 font-medium">Graded</th>
                  <th className="px-4 py-2.5 font-medium">Average</th>
                  <th className="px-4 py-2.5 font-medium">Pass rate</th>
                  {comparing ? (
                    <>
                      <th className="px-4 py-2.5 font-medium">Earlier average</th>
                      <th className="px-4 py-2.5 font-medium">Earlier pass rate</th>
                      <th className="px-4 py-2.5 font-medium">Change</th>
                    </>
                  ) : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {(row.students ?? []).map((student) => (
                  <tr key={student.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{student.name}</p>
                      <p className="mt-0.5 text-[12px] text-muted-foreground">
                        {student.studentNumber}
                      </p>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{student.graded}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {formatPercent(student.averageScorePercent)}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {formatPercent(student.passRatePercent)}
                    </td>
                    {comparing ? (
                      <>
                        <td className="px-4 py-3 tabular-nums">
                          {formatPercent(student.compareAverageScorePercent)}
                        </td>
                        <td className="px-4 py-3 tabular-nums">
                          {formatPercent(student.comparePassRatePercent)}
                        </td>
                        <td className="px-4 py-3 tabular-nums">
                          {formatPoints(
                            student.passRatePercent,
                            student.comparePassRatePercent,
                          )}
                        </td>
                      </>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<PageLoading label="Loading report…" />}>
      <ReportsScreen />
    </Suspense>
  );
}
