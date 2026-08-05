"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, BookOpen, Users } from "lucide-react";
import { ApiRequestError, subjectsApi } from "@/lib/api";
import type { SubjectDetail } from "@/lib/types";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { StatStrip } from "@/components/ui/stat-strip";
import { StatusBadge, statusToneFor } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

function subjectInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function studentInitials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

export default function SubjectDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<SubjectDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    subjectsApi
      .get(params.id)
      .then(setData)
      .catch((err) =>
        setError(
          err instanceof ApiRequestError
            ? err.message
            : "Failed to load subject",
        ),
      );
  }, [params.id]);

  if (error && !data) {
    return (
      <div className="space-y-4">
        <Link
          href="/subjects"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-3.5" strokeWidth={1.75} />
          Subjects
        </Link>
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
          role="alert"
        >
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return <PageLoading label="Loading subject…" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/subjects"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-3.5" strokeWidth={1.75} />
          Subjects
        </Link>

        <div className="mt-4 flex flex-wrap items-start gap-4 border-b border-border pb-6">
          <span
            className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand-light text-[14px] font-semibold text-brand"
            aria-hidden
          >
            {subjectInitials(data.name)}
          </span>
          <div className="min-w-0 flex-1">
            <PageHeader
              eyebrow="Subject"
              title={data.name}
              description={data.description ?? undefined}
              className="border-b-0 pb-0"
              actions={
                <span className="inline-flex items-center rounded-md border border-border bg-background px-2.5 py-1 font-mono text-[12px] font-medium text-ink tabular-nums">
                  {data.code}
                </span>
              }
            />
          </div>
        </div>
      </div>

      <StatStrip
        items={[
          { label: "Classes", value: data.classes.length },
          { label: "Students", value: data.students.length },
        ]}
      />

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-[13px] font-semibold tracking-tight text-ink">
              <BookOpen className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
              Classes
            </h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              Classes linked to this subject
            </p>
          </div>
        </div>

        {data.classes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card">
            <EmptyState
              title="No classes yet"
              description="No classes are linked to this subject yet."
            />
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] table-fixed border-collapse text-left">
                <colgroup>
                  <col className="w-[32%]" />
                  <col className="w-[14%]" />
                  <col className="w-[16%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[14%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[11px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
                    <th className="px-5 py-2.5 font-medium">Class</th>
                    <th className="px-5 py-2.5 font-medium">Code</th>
                    <th className="px-5 py-2.5 font-medium">Term</th>
                    <th className="px-5 py-2.5 text-right font-medium">
                      Students
                    </th>
                    <th className="px-5 py-2.5 text-right font-medium">
                      Work
                    </th>
                    <th className="px-5 py-2.5 text-right font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.classes.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-border last:border-b-0 transition-colors duration-150 ease-craft hover:bg-muted/40"
                    >
                      <td className="px-5 py-3.5 align-middle">
                        <Link
                          href={`/classes/${c.id}`}
                          className="truncate text-[14px] font-semibold tracking-tight text-ink hover:text-brand"
                        >
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 align-middle">
                        <span className="inline-flex max-w-full truncate rounded-md border border-border bg-background px-2 py-1 font-mono text-[12px] font-medium text-ink tabular-nums">
                          {c.classCode}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 align-middle font-mono text-[12px] text-muted-foreground tabular-nums">
                        {c.academicYear} · S{c.semester}
                      </td>
                      <td className="px-5 py-3.5 text-right align-middle font-mono text-[13px] text-ink tabular-nums">
                        <Link
                          href={`/classes/${c.id}#students`}
                          className="hover:text-brand hover:underline"
                        >
                          {c._count.classStudents}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-right align-middle font-mono text-[13px] text-ink tabular-nums">
                        {c._count.assignments}
                      </td>
                      <td className="px-5 py-3.5 text-right align-middle">
                        <StatusBadge tone={statusToneFor(c.status)}>
                          {c.status.charAt(0) + c.status.slice(1).toLowerCase()}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <section id="students" className="scroll-mt-20 space-y-3">
        <div>
          <h2 className="flex items-center gap-2 text-[13px] font-semibold tracking-tight text-ink">
            <Users className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
            Students
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground tabular-nums">
              {data.students.length}
            </span>
          </h2>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Everyone enrolled in classes for this subject
          </p>
        </div>

        {data.students.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card">
            <EmptyState
              title="No students yet"
              description="No students are enrolled in classes for this subject."
            />
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] table-fixed border-collapse text-left">
                <colgroup>
                  <col className="w-[24%]" />
                  <col className="w-[14%]" />
                  <col className="w-[24%]" />
                  <col className="w-[14%]" />
                  <col className="w-[24%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[11px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
                    <th className="px-5 py-2.5 font-medium">Name</th>
                    <th className="px-5 py-2.5 font-medium">Student no.</th>
                    <th className="px-5 py-2.5 font-medium">Email</th>
                    <th className="px-5 py-2.5 font-medium">Phone</th>
                    <th className="px-5 py-2.5 font-medium">Class</th>
                  </tr>
                </thead>
                <tbody>
                  {data.students.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-border last:border-b-0 transition-colors duration-150 ease-craft hover:bg-muted/40"
                    >
                      <td className="px-5 py-3.5 align-middle">
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-semibold text-slate-600"
                            aria-hidden
                          >
                            {studentInitials(s.firstName, s.lastName)}
                          </span>
                          <span className="truncate text-[14px] font-semibold tracking-tight text-ink">
                            {s.firstName} {s.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 align-middle">
                        <span className="font-mono text-[12px] text-ink tabular-nums">
                          {s.studentNumber}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 align-middle">
                        <span className="block truncate text-[13px] text-slate-600">
                          {s.email}
                        </span>
                      </td>
                      <td
                        className={cn(
                          "px-5 py-3.5 align-middle text-[13px]",
                          s.phoneNumber
                            ? "font-mono text-slate-600 tabular-nums"
                            : "text-muted-foreground",
                        )}
                      >
                        {s.phoneNumber || "—"}
                      </td>
                      <td className="px-5 py-3.5 align-middle text-[13px]">
                        <div className="flex flex-wrap gap-1.5">
                          {s.classes.map((c) => (
                            <Link
                              key={c.id}
                              href={`/classes/${c.id}#students`}
                              className="inline-flex max-w-full truncate rounded-md border border-border bg-background px-2 py-0.5 text-[12px] font-medium text-ink transition-colors hover:border-brand/30 hover:bg-brand-light hover:text-brand"
                            >
                              {c.name}
                            </Link>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
