"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiRequestError, submissionsApi } from "@/lib/api";
import type { Submission } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { ListPagination } from "@/components/ui/list-pagination";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoading } from "@/components/ui/page-loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge, statusToneFor } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

type StatusFilter = "ALL" | "NEEDS_GRADING" | "GRADED" | "LATE";
type SortMode = "newest" | "oldest" | "assignment";

const PAGE_SIZE = 20;

function studentName(s: Submission) {
  return s.student?.user
    ? `${s.student.user.firstName} ${s.student.user.lastName}`
    : "Student";
}

function studentInitials(s: Submission) {
  const u = s.student?.user;
  if (!u) return "?";
  return `${u.firstName[0] ?? ""}${u.lastName[0] ?? ""}`.toUpperCase();
}

function assignmentIdOf(s: Submission) {
  return s.assignment?.id ?? s.assignmentId;
}

function assignmentHref(s: Submission) {
  const id = assignmentIdOf(s);
  return id ? `/assignments/${id}#submission-${s.id}` : null;
}

function needsGrade(s: Submission) {
  return s.status === "SUBMITTED" || s.status === "LATE";
}

function formatSubmittedAt(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function SubmissionsPage() {
  const { user } = useAuth();
  const isStudent = user?.role === "STUDENT";

  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    submissionsApi
      .list()
      .then(setItems)
      .catch((err) =>
        setError(
          err instanceof ApiRequestError
            ? err.message
            : "Failed to load submissions",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const needsGradingCount = useMemo(
    () => items.filter(needsGrade).length,
    [items],
  );
  const gradedCount = useMemo(
    () => items.filter((s) => s.status === "GRADED").length,
    [items],
  );

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = items.filter((s) => {
      if (statusFilter === "NEEDS_GRADING" && !needsGrade(s)) return false;
      if (statusFilter === "GRADED" && s.status !== "GRADED") return false;
      if (statusFilter === "LATE" && s.status !== "LATE") return false;
      if (!q) return true;
      const name = studentName(s).toLowerCase();
      const title = s.assignment?.title?.toLowerCase() ?? "";
      const className = s.assignment?.class?.name?.toLowerCase() ?? "";
      return title.includes(q) || name.includes(q) || className.includes(q);
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sortMode === "assignment") {
        const ta = a.assignment?.title ?? "";
        const tb = b.assignment?.title ?? "";
        const byTitle = ta.localeCompare(tb);
        if (byTitle !== 0) return byTitle;
        return (
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );
      }
      const diff =
        new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      return sortMode === "oldest" ? diff : -diff;
    });
    return sorted;
  }, [items, query, statusFilter, sortMode]);

  const totalFiltered = filteredSorted.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredSorted.slice(start, start + PAGE_SIZE);
  }, [filteredSorted, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, sortMode]);

  function clearFilters() {
    setQuery("");
    setStatusFilter("ALL");
    setSortMode("newest");
    setPage(1);
  }

  if (loading) {
    return <PageLoading label="Loading submissions…" />;
  }

  const rangeStart =
    totalFiltered === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, totalFiltered);

  const statusChips: Array<{ id: StatusFilter; label: string }> = isStudent
    ? [
        { id: "ALL", label: "All" },
        { id: "GRADED", label: "Graded" },
        { id: "LATE", label: "Late" },
      ]
    : [
        { id: "ALL", label: "All" },
        { id: "NEEDS_GRADING", label: "Needs grading" },
        { id: "GRADED", label: "Graded" },
        { id: "LATE", label: "Late" },
      ];

  const description =
    items.length === 0
      ? isStudent
        ? "Your submitted work and scores will appear here."
        : "Open a row to preview the file, score, and leave feedback."
      : isStudent
        ? `${gradedCount} graded · ${items.length} total`
        : `${needsGradingCount} need grading · ${items.length} total`;

  return (
    <div className="flex min-h-[calc(100svh-8.5rem)] flex-col gap-6">
      {error && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      <PageHeader
        eyebrow="Academics"
        title="Submissions"
        description={description}
      />

      {items.length > 0 && (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:p-3.5">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                isStudent
                  ? "Search by assignment or class…"
                  : "Search by assignment, class, or student…"
              }
              className="h-9 rounded-md border-border bg-background pl-9 text-sm shadow-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1 rounded-md border border-border bg-background p-0.5">
            {statusChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setStatusFilter(chip.id)}
                className={cn(
                  "h-8 rounded-[5px] px-3 text-[12px] font-medium transition-colors duration-150 ease-craft",
                  statusFilter === chip.id
                    ? "bg-brand text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-ink",
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-muted-foreground">
              Sort
            </span>
            <Select
              value={sortMode}
              onValueChange={(value) => {
                if (
                  value === "newest" ||
                  value === "oldest" ||
                  value === "assignment"
                ) {
                  setSortMode(value);
                }
              }}
            >
              <SelectTrigger className="h-9 w-[150px] rounded-md border-border bg-background text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="assignment">Assignment A–Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card">
          <EmptyState
            title="No submissions yet"
            description={
              isStudent
                ? "When you turn in assignments, they will appear here with scores and feedback."
                : "When students turn in work on your assignments, it will appear here."
            }
            action={
              <ButtonLink href="/assignments" size="sm">
                Go to assignments
              </ButtonLink>
            }
          />
        </div>
      ) : totalFiltered === 0 ? (
        <div className="rounded-lg border border-border bg-card">
          <EmptyState
            title="No matches"
            description="Try a different search, or clear filters to see all submissions."
            action={
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={clearFilters}
              >
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-4">
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <ul className="divide-y divide-border sm:hidden">
              {pageItems.map((s) => {
                const href = assignmentHref(s);
                const pending = !isStudent && needsGrade(s);
                return (
                  <li key={s.id} className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      <span
                        className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-light text-[12px] font-semibold text-brand"
                        aria-hidden
                      >
                        {isStudent
                          ? s.score != null
                            ? String(s.score)
                            : "—"
                          : studentInitials(s)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold tracking-tight text-ink">
                          {isStudent
                            ? (s.assignment?.title ?? "Assignment")
                            : studentName(s)}
                        </p>
                        <p className="mt-1 truncate text-[12px] text-muted-foreground">
                          {isStudent
                            ? (s.assignment?.class?.name ?? "Class")
                            : (s.assignment?.title ?? "Assignment")}
                          {" · "}
                          {formatSubmittedAt(s.submittedAt)}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <StatusBadge tone={statusToneFor(s.status)}>
                            {s.status.charAt(0) +
                              s.status.slice(1).toLowerCase()}
                          </StatusBadge>
                          <span className="font-mono text-[12px] text-muted-foreground tabular-nums">
                            {s.score != null
                              ? `${s.score}${
                                  s.assignment?.totalMarks != null
                                    ? `/${s.assignment.totalMarks}`
                                    : ""
                                }`
                              : "No score"}
                          </span>
                        </div>
                      </div>
                    </div>
                    {href ? (
                      <div className="mt-3 pl-[3.25rem]">
                        <ButtonLink
                          href={href}
                          size="sm"
                          variant={pending ? "default" : "outline"}
                          className="w-full"
                        >
                          {pending ? "Review" : "Open"}
                        </ButtonLink>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>

            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[780px] table-fixed border-collapse text-left">
                <colgroup>
                  {isStudent ? (
                    <>
                      <col className="w-[30%]" />
                      <col className="w-[18%]" />
                      <col className="w-[16%]" />
                      <col className="w-[12%]" />
                      <col className="w-[12%]" />
                      <col className="w-[12%]" />
                    </>
                  ) : (
                    <>
                      <col className="w-[22%]" />
                      <col className="w-[24%]" />
                      <col className="w-[16%]" />
                      <col className="w-[12%]" />
                      <col className="w-[12%]" />
                      <col className="w-[14%]" />
                    </>
                  )}
                </colgroup>
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[11px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
                    <th className="px-5 py-2.5 font-medium">
                      {isStudent ? "Assignment" : "Student"}
                    </th>
                    <th className="px-5 py-2.5 font-medium">
                      {isStudent ? "Class" : "Assignment"}
                    </th>
                    <th className="px-5 py-2.5 font-medium">Submitted</th>
                    <th className="px-5 py-2.5 font-medium">Status</th>
                    <th className="px-5 py-2.5 text-right font-medium">Score</th>
                    <th className="px-5 py-2.5 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((s) => {
                    const href = assignmentHref(s);
                    const pending = !isStudent && needsGrade(s);
                    return (
                      <tr
                        key={s.id}
                        className="border-b border-border last:border-b-0 transition-colors duration-150 ease-craft hover:bg-muted/40"
                      >
                        <td className="px-5 py-3.5 align-middle">
                          <div className="flex min-w-0 items-center gap-3">
                            <span
                              className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand-light text-[11px] font-semibold text-brand"
                              aria-hidden
                            >
                              {isStudent
                                ? s.score != null
                                  ? String(s.score)
                                  : "—"
                                : studentInitials(s)}
                            </span>
                            <span className="truncate text-[14px] font-semibold tracking-tight text-ink">
                              {isStudent
                                ? (s.assignment?.title ?? "Assignment")
                                : studentName(s)}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 align-middle">
                          {isStudent ? (
                            <span className="block truncate text-[13px] text-slate-600">
                              {s.assignment?.class?.name ?? "—"}
                            </span>
                          ) : assignmentIdOf(s) ? (
                            <Link
                              href={`/assignments/${assignmentIdOf(s)}`}
                              className="block truncate text-[13px] font-medium text-ink hover:text-brand hover:underline"
                            >
                              {s.assignment?.title ?? "Assignment"}
                            </Link>
                          ) : (
                            <span className="text-[13px] text-muted-foreground">
                              —
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 align-middle font-mono text-[12px] text-muted-foreground tabular-nums">
                          {formatSubmittedAt(s.submittedAt)}
                        </td>
                        <td className="px-5 py-3.5 align-middle">
                          <StatusBadge tone={statusToneFor(s.status)}>
                            {s.status.charAt(0) +
                              s.status.slice(1).toLowerCase()}
                          </StatusBadge>
                        </td>
                        <td className="px-5 py-3.5 text-right align-middle font-mono text-[13px] text-ink tabular-nums">
                          {s.score != null
                            ? `${s.score}${
                                s.assignment?.totalMarks != null
                                  ? `/${s.assignment.totalMarks}`
                                  : ""
                              }`
                            : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-right align-middle">
                          {href ? (
                            <ButtonLink
                              href={href}
                              size="sm"
                              variant={pending ? "default" : "outline"}
                            >
                              {pending ? "Review" : "Open"}
                            </ButtonLink>
                          ) : (
                            <span className="text-[12px] text-muted-foreground">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <ListPagination
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            total={totalFiltered}
            page={currentPage}
            totalPages={totalPages}
            onPrevious={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </div>
      )}
    </div>
  );
}
