"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Paperclip, Plus, Search } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiRequestError, assignmentsApi } from "@/lib/api";
import type { Assignment } from "@/lib/types";
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

type StatusFilter = "ALL" | "DRAFT" | "PUBLISHED" | "CLOSED";
type SortMode = "due_soon" | "due_late" | "title";

const PAGE_SIZE = 20;

function formatDue(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isOverdueForStudent(a: Assignment) {
  return (
    a.status === "PUBLISHED" &&
    new Date(a.dueDate).getTime() < Date.now() &&
    !a.submissions?.[0]
  );
}

function assignmentInitials(title: string) {
  const parts = title.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export default function AssignmentsPageClient() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const classIdFilter = searchParams.get("classId") ?? undefined;
  const isStudent = user?.role === "STUDENT";
  const canManage = user?.role === "TEACHER" || user?.role === "ADMIN";

  const [items, setItems] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sortMode, setSortMode] = useState<SortMode>("due_soon");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      setItems(await assignmentsApi.list(classIdFilter));
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Failed to load",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classIdFilter]);

  const publishedCount = useMemo(
    () => items.filter((a) => a.status === "PUBLISHED").length,
    [items],
  );
  const draftCount = useMemo(
    () => items.filter((a) => a.status === "DRAFT").length,
    [items],
  );

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = items.filter((a) => {
      if (statusFilter !== "ALL" && a.status !== statusFilter) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        (a.class?.name?.toLowerCase().includes(q) ?? false)
      );
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sortMode === "title") {
        const byTitle = a.title.localeCompare(b.title);
        if (byTitle !== 0) return byTitle;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      const diff =
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      return sortMode === "due_late" ? -diff : diff;
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
  }, [query, statusFilter, sortMode, classIdFilter]);

  function clearFilters() {
    setQuery("");
    setStatusFilter("ALL");
    setSortMode("due_soon");
    setPage(1);
  }

  if (loading) {
    return <PageLoading label="Loading assignments…" />;
  }

  const newHref = classIdFilter
    ? `/assignments/new?classId=${classIdFilter}`
    : "/assignments/new";

  const statusChips = (
    isStudent
      ? (["ALL", "PUBLISHED", "CLOSED"] as const)
      : (["ALL", "PUBLISHED", "DRAFT", "CLOSED"] as const)
  ).map((status) => ({
    id: status as StatusFilter,
    label:
      status === "ALL"
        ? "All"
        : status.charAt(0) + status.slice(1).toLowerCase(),
  }));

  const rangeStart =
    totalFiltered === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, totalFiltered);

  const description =
    items.length === 0
      ? isStudent
        ? "Open an assignment to preview files and submit your work."
        : "Publish work, set due dates, and collect submissions."
      : isStudent
        ? `${publishedCount} open · ${items.length} total`
        : `${publishedCount} published${draftCount ? ` · ${draftCount} draft` : ""} · ${items.length} total`;

  return (
    <div className="flex min-h-[calc(100svh-8.5rem)] flex-col gap-6">
      <PageHeader
        eyebrow="Academics"
        title="Assignments"
        description={description}
        actions={
          canManage ? (
            <ButtonLink href={newHref} size="sm">
              <Plus className="size-3.5" />
              New assignment
            </ButtonLink>
          ) : undefined
        }
      />

      {error && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      {items.length > 0 && (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:p-3.5">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or class…"
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
                  value === "due_soon" ||
                  value === "due_late" ||
                  value === "title"
                ) {
                  setSortMode(value);
                }
              }}
            >
              <SelectTrigger className="h-9 w-[140px] rounded-md border-border bg-background text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="due_soon">Due soon</SelectItem>
                <SelectItem value="due_late">Due latest</SelectItem>
                <SelectItem value="title">Title A–Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card">
          <EmptyState
            title="No assignments yet"
            description={
              isStudent
                ? "When your teacher publishes work, it will show up here."
                : "Create an assignment for one of your classes to get started."
            }
            action={
              canManage ? (
                <ButtonLink href={newHref} size="sm">
                  <Plus className="size-3.5" />
                  New assignment
                </ButtonLink>
              ) : undefined
            }
          />
        </div>
      ) : totalFiltered === 0 ? (
        <div className="rounded-lg border border-border bg-card">
          <EmptyState
            title="No matches"
            description="Try a different search, or clear filters to see all assignments."
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
              {pageItems.map((a) => {
                const overdue = isStudent && isOverdueForStudent(a);
                const myStatus = a.submissions?.[0]?.status;
                return (
                  <li
                    key={a.id}
                    className={cn("px-4 py-4", overdue && "bg-red-50/40")}
                  >
                    <Link
                      href={`/assignments/${a.id}`}
                      className="flex items-start gap-3"
                    >
                      <span
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-md text-[12px] font-semibold",
                          overdue
                            ? "bg-red-50 text-red-700"
                            : "bg-brand-light text-brand",
                        )}
                        aria-hidden
                      >
                        {assignmentInitials(a.title)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-semibold tracking-tight text-ink">
                          {a.title}
                        </span>
                        <span className="mt-1 block truncate text-[12px] text-muted-foreground">
                          {a.class?.name ?? "Class"} · {a.totalMarks} marks
                        </span>
                        <span className="mt-2 flex flex-wrap items-center gap-2">
                          <StatusBadge
                            tone={
                              isStudent
                                ? overdue
                                  ? "danger"
                                  : myStatus
                                    ? statusToneFor(myStatus)
                                    : "warning"
                                : statusToneFor(a.status)
                            }
                          >
                            {isStudent
                              ? overdue
                                ? "Overdue"
                                : myStatus
                                  ? myStatus.charAt(0) +
                                    myStatus.slice(1).toLowerCase()
                                  : "Not submitted"
                              : a.status.charAt(0) +
                                a.status.slice(1).toLowerCase()}
                          </StatusBadge>
                          <span
                            className={cn(
                              "font-mono text-[12px] tabular-nums",
                              overdue
                                ? "font-medium text-red-700"
                                : "text-muted-foreground",
                            )}
                          >
                            Due {formatDue(a.dueDate)}
                          </span>
                        </span>
                      </span>
                    </Link>
                    <div className="mt-3 pl-[3.25rem]">
                      <ButtonLink
                        href={`/assignments/${a.id}`}
                        size="sm"
                        variant={isStudent && !myStatus ? "default" : "outline"}
                        className="w-full"
                      >
                        {isStudent ? (myStatus ? "Open" : "Submit") : "Open"}
                      </ButtonLink>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[800px] table-fixed border-collapse text-left">
                <colgroup>
                  <col className="w-[32%]" />
                  <col className="w-[18%]" />
                  <col className="w-[14%]" />
                  <col className="w-[10%]" />
                  <col className="w-[14%]" />
                  <col className="w-[12%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[11px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
                    <th className="px-5 py-2.5 font-medium">Assignment</th>
                    <th className="px-5 py-2.5 font-medium">Class</th>
                    <th className="px-5 py-2.5 font-medium">Due</th>
                    <th className="px-5 py-2.5 text-right font-medium">Marks</th>
                    <th className="px-5 py-2.5 font-medium">
                      {isStudent ? "Your status" : "Status"}
                    </th>
                    <th className="px-5 py-2.5 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((a) => {
                    const overdue = isStudent && isOverdueForStudent(a);
                    const myStatus = a.submissions?.[0]?.status;
                    return (
                      <tr
                        key={a.id}
                        className={cn(
                          "border-b border-border last:border-b-0 transition-colors duration-150 ease-craft hover:bg-muted/40",
                          overdue && "bg-red-50/30",
                        )}
                      >
                        <td className="px-5 py-3.5 align-middle">
                          <Link
                            href={`/assignments/${a.id}`}
                            className="flex min-w-0 items-center gap-3"
                          >
                            <span
                              className={cn(
                                "flex size-9 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold",
                                overdue
                                  ? "bg-red-50 text-red-700"
                                  : "bg-brand-light text-brand",
                              )}
                              aria-hidden
                            >
                              {assignmentInitials(a.title)}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-[14px] font-semibold tracking-tight text-ink hover:text-brand">
                                {a.title}
                              </span>
                              {a.attachment ? (
                                <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                  <Paperclip className="size-3" />
                                  Attachment
                                </span>
                              ) : null}
                            </span>
                          </Link>
                        </td>
                        <td className="px-5 py-3.5 align-middle">
                          {a.class?.id ? (
                            <Link
                              href={`/classes/${a.class.id}`}
                              className="block truncate text-[13px] font-medium text-ink hover:text-brand hover:underline"
                            >
                              {a.class.name}
                            </Link>
                          ) : (
                            <span className="text-[13px] text-muted-foreground">
                              —
                            </span>
                          )}
                        </td>
                        <td
                          className={cn(
                            "px-5 py-3.5 align-middle font-mono text-[12px] tabular-nums",
                            overdue
                              ? "font-medium text-red-700"
                              : "text-muted-foreground",
                          )}
                        >
                          {formatDue(a.dueDate)}
                        </td>
                        <td className="px-5 py-3.5 text-right align-middle font-mono text-[13px] text-ink tabular-nums">
                          {a.totalMarks}
                        </td>
                        <td className="px-5 py-3.5 align-middle">
                          {isStudent ? (
                            <StatusBadge
                              tone={
                                overdue
                                  ? "danger"
                                  : myStatus
                                    ? statusToneFor(myStatus)
                                    : "warning"
                              }
                            >
                              {overdue
                                ? "Overdue"
                                : myStatus
                                  ? myStatus.charAt(0) +
                                    myStatus.slice(1).toLowerCase()
                                  : "Not submitted"}
                            </StatusBadge>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <StatusBadge tone={statusToneFor(a.status)}>
                                {a.status.charAt(0) +
                                  a.status.slice(1).toLowerCase()}
                              </StatusBadge>
                              <span className="text-[11px] text-muted-foreground">
                                {a._count?.submissions ?? 0} submission
                                {(a._count?.submissions ?? 0) === 1 ? "" : "s"}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right align-middle">
                          <ButtonLink
                            href={`/assignments/${a.id}`}
                            size="sm"
                            variant={
                              isStudent && !myStatus ? "default" : "outline"
                            }
                          >
                            {isStudent
                              ? myStatus
                                ? "Open"
                                : "Submit"
                              : "Open"}
                          </ButtonLink>
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
