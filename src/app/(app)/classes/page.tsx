"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Copy, Plus, Search } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiRequestError, classesApi, setToken } from "@/lib/api";
import { toast, toastFromError } from "@/lib/toast";
import type { ClassRoom } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useSchoolSetupCounts } from "@/hooks/use-school-setup";
import { cn } from "@/lib/utils";

type StatusFilter = "ALL" | "ACTIVE" | "ARCHIVED";
type SortMode = "name" | "students" | "year";

const PAGE_SIZE = 20;

function classInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export default function ClassesPage() {
  const { user, refreshUser } = useAuth();
  const isStudent = user?.role === "STUDENT";
  const canManage = user?.role === "SCHOOL_ADMIN" || user?.role === "ADMIN";
  const isSchoolAdmin = user?.role === "SCHOOL_ADMIN";
  const { counts: setupCounts } = useSchoolSetupCounts(isSchoolAdmin);

  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sortMode, setSortMode] = useState<SortMode>("name");
  const [page, setPage] = useState(1);
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      const data = await classesApi.list();
      setClasses(data);
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Failed to load classes",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = classes.filter((c) => {
      if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.classCode.toLowerCase().includes(q) ||
        (c.subject?.name?.toLowerCase().includes(q) ?? false) ||
        (c.subject?.code?.toLowerCase().includes(q) ?? false)
      );
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sortMode === "students") {
        const diff =
          (b._count?.classStudents ?? 0) - (a._count?.classStudents ?? 0);
        if (diff !== 0) return diff;
        return a.name.localeCompare(b.name);
      }
      if (sortMode === "year") {
        if (b.academicYear !== a.academicYear) {
          return b.academicYear - a.academicYear;
        }
        if (b.semester !== a.semester) return b.semester - a.semester;
        return a.name.localeCompare(b.name);
      }
      return a.name.localeCompare(b.name);
    });
    return sorted;
  }, [classes, query, statusFilter, sortMode]);

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
    setSortMode("name");
    setPage(1);
  }

  async function joinClass(e: React.FormEvent) {
    e.preventDefault();
    setJoining(true);
    try {
      const result = await classesApi.join(joinCode.trim().toUpperCase());
      setToken(result.token);
      await refreshUser();
      setJoinCode("");
      setLoading(true);
      await load();
    } catch (err) {
      toastFromError(err, "Could not join");
    } finally {
      setJoining(false);
    }
  }

  async function copyCode(code: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(null), 1600);
    } catch {
      toast.error("Could not copy code");
    }
  }

  if (loading) {
    return <PageLoading label="Loading classes…" />;
  }

  const rangeStart =
    totalFiltered === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, totalFiltered);
  const needsSubjectFirst =
    isSchoolAdmin && (setupCounts ? setupCounts.subjects === 0 : false);

  const description = isStudent
    ? "Join with a code or open a class you are enrolled in."
    : user?.role === "TEACHER"
      ? "Classes allocated to you by your school admin."
      : needsSubjectFirst
        ? "Add a subject first — a class belongs to one subject."
        : "Create and manage classes for your school.";

  return (
    <div className="flex min-h-[calc(100svh-8.5rem)] flex-col gap-6">
      <PageHeader
        eyebrow="Academics"
        title="Classes"
        description={
          classes.length === 0
            ? description
            : `${classes.length} class${classes.length === 1 ? "" : "es"} · ${description}`
        }
        actions={
          canManage ? (
            needsSubjectFirst ? (
              <ButtonLink href="/subjects/new" size="sm">
                <Plus className="size-3.5" />
                Add subject
              </ButtonLink>
            ) : (
              <ButtonLink href="/classes/new" size="sm">
                <Plus className="size-3.5" />
                New class
              </ButtonLink>
            )
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

      {isStudent && (
        <form
          onSubmit={joinClass}
          className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-end"
        >
          <div className="flex-1 space-y-1.5">
            <Label
              htmlFor="classCode"
              className="text-[13px] font-medium text-slate-700"
            >
              Join with class code
            </Label>
            <Input
              id="classCode"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="e.g. K3RKRBYC"
              className="h-9 rounded-md border-border bg-background font-mono text-sm uppercase shadow-none"
              required
            />
          </div>
          <Button type="submit" disabled={joining} size="sm">
            {joining ? "Joining…" : "Join class"}
          </Button>
        </form>
      )}

      {classes.length > 0 && (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:p-3.5">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, subject, or code…"
              className="h-9 rounded-md border-border bg-background pl-9 text-sm shadow-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1 rounded-md border border-border bg-background p-0.5">
            {(["ALL", "ACTIVE", "ARCHIVED"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "h-8 rounded-[5px] px-3 text-[12px] font-medium transition-colors duration-150 ease-craft",
                  statusFilter === status
                    ? "bg-brand text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-ink",
                )}
              >
                {status === "ALL"
                  ? "All"
                  : status === "ACTIVE"
                    ? "Active"
                    : "Archived"}
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
                  value === "name" ||
                  value === "students" ||
                  value === "year"
                ) {
                  setSortMode(value);
                }
              }}
            >
              <SelectTrigger className="h-9 w-[150px] rounded-md border-border bg-background text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A–Z</SelectItem>
                <SelectItem value="students">Most students</SelectItem>
                <SelectItem value="year">Newest year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {classes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card">
          <EmptyState
            title="No classes yet"
            description={
              isStudent
                ? "Ask your teacher for a class code, then join from the form above."
                : user?.role === "TEACHER"
                  ? "Your school admin will allocate classes to your account."
                  : needsSubjectFirst
                    ? "Add a subject first, then create a class under it."
                    : "Create a class under a subject, then add a teacher and assign them to it."
            }
            action={
              canManage ? (
                needsSubjectFirst ? (
                  <ButtonLink href="/subjects/new" size="sm">
                    <Plus className="size-3.5" />
                    Add subject
                  </ButtonLink>
                ) : (
                  <ButtonLink href="/classes/new" size="sm">
                    <Plus className="size-3.5" />
                    New class
                  </ButtonLink>
                )
              ) : undefined
            }
          />
        </div>
      ) : totalFiltered === 0 ? (
        <div className="rounded-lg border border-border bg-card">
          <EmptyState
            title="No matches"
            description="Try a different search, or clear filters to see all classes."
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
            {/* Mobile */}
            <ul className="divide-y divide-border sm:hidden">
              {pageItems.map((c) => {
                const studentCount = c._count?.classStudents ?? 0;
                return (
                  <li key={c.id} className="px-4 py-4">
                    <Link
                      href={`/classes/${c.id}`}
                      className="flex items-start gap-3"
                    >
                      <span
                        className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-light text-[12px] font-semibold text-brand"
                        aria-hidden
                      >
                        {classInitials(c.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate text-[15px] font-semibold tracking-tight text-ink">
                            {c.name}
                          </span>
                          <ChevronRight className="size-3.5 shrink-0 text-slate-300" />
                        </span>
                        <span className="mt-1 block truncate text-[12px] text-muted-foreground">
                          {c.subject
                            ? `${c.subject.code} · ${c.subject.name}`
                            : "No subject"}
                        </span>
                        <span className="mt-2 flex flex-wrap items-center gap-2">
                          <StatusBadge tone={statusToneFor(c.status)}>
                            {c.status.charAt(0) +
                              c.status.slice(1).toLowerCase()}
                          </StatusBadge>
                          <span className="font-mono text-[12px] text-muted-foreground tabular-nums">
                            {c.academicYear} · S{c.semester}
                          </span>
                          <span className="text-[12px] text-muted-foreground">
                            {studentCount} student
                            {studentCount === 1 ? "" : "s"}
                          </span>
                        </span>
                      </span>
                    </Link>
                    <div className="mt-3 flex gap-2 pl-[3.25rem]">
                      <button
                        type="button"
                        onClick={(e) => void copyCode(c.classCode, e)}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-background px-2 py-2 font-mono text-[12px] font-medium text-ink"
                      >
                        {c.classCode}
                        <Copy className="size-3 opacity-50" />
                        {copiedCode === c.classCode ? (
                          <span className="font-sans text-[11px] text-brand">
                            Copied
                          </span>
                        ) : null}
                      </button>
                      <ButtonLink
                        href={`/classes/${c.id}`}
                        size="sm"
                        variant="outline"
                        className="flex-1"
                      >
                        Open
                      </ButtonLink>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[820px] table-fixed border-collapse text-left">
                <colgroup>
                  <col className="w-[26%]" />
                  <col className="w-[20%]" />
                  <col className="w-[14%]" />
                  <col className="w-[12%]" />
                  <col className="w-[10%]" />
                  <col className="w-[10%]" />
                  <col className="w-[8%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[11px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
                    <th className="px-5 py-2.5 font-medium">Class</th>
                    <th className="px-5 py-2.5 font-medium">Subject</th>
                    <th className="px-5 py-2.5 font-medium">Code</th>
                    <th className="px-5 py-2.5 font-medium">Term</th>
                    <th className="px-5 py-2.5 text-right font-medium">
                      Students
                    </th>
                    <th className="px-5 py-2.5 font-medium">Status</th>
                    <th className="px-5 py-2.5 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((c) => {
                    const studentCount = c._count?.classStudents ?? 0;
                    return (
                      <tr
                        key={c.id}
                        className="border-b border-border last:border-b-0 transition-colors duration-150 ease-craft hover:bg-muted/40"
                      >
                        <td className="px-5 py-3.5 align-middle">
                          <Link
                            href={`/classes/${c.id}`}
                            className="flex min-w-0 items-center gap-3"
                          >
                            <span
                              className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand-light text-[11px] font-semibold text-brand"
                              aria-hidden
                            >
                              {classInitials(c.name)}
                            </span>
                            <span className="truncate text-[14px] font-semibold tracking-tight text-ink hover:text-brand">
                              {c.name}
                            </span>
                          </Link>
                        </td>
                        <td className="px-5 py-3.5 align-middle">
                          {c.subject ? (
                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-medium text-ink">
                                {c.subject.name}
                              </p>
                              <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                                {c.subject.code}
                              </p>
                            </div>
                          ) : (
                            <span className="text-[13px] text-muted-foreground">
                              No subject
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 align-middle">
                          <button
                            type="button"
                            onClick={(e) => void copyCode(c.classCode, e)}
                            className="inline-flex max-w-full items-center gap-1.5 truncate rounded-md border border-border bg-background px-2 py-1 font-mono text-[12px] font-medium text-ink tabular-nums transition-colors hover:border-brand/30 hover:bg-brand-light hover:text-brand"
                            title="Copy class code"
                          >
                            <span className="truncate">{c.classCode}</span>
                            <Copy className="size-3 shrink-0 opacity-50" />
                            {copiedCode === c.classCode ? (
                              <span className="font-sans text-[11px] text-brand">
                                Copied
                              </span>
                            ) : null}
                          </button>
                        </td>
                        <td className="px-5 py-3.5 align-middle font-mono text-[12px] text-muted-foreground tabular-nums">
                          {c.academicYear} · S{c.semester}
                        </td>
                        <td className="px-5 py-3.5 text-right align-middle font-mono text-[13px] text-ink tabular-nums">
                          <Link
                            href={`/classes/${c.id}#students`}
                            className="hover:text-brand hover:underline"
                          >
                            {studentCount}
                          </Link>
                        </td>
                        <td className="px-5 py-3.5 align-middle">
                          <StatusBadge tone={statusToneFor(c.status)}>
                            {c.status.charAt(0) +
                              c.status.slice(1).toLowerCase()}
                          </StatusBadge>
                        </td>
                        <td className="px-5 py-3.5 text-right align-middle">
                          <ButtonLink
                            href={`/classes/${c.id}`}
                            size="sm"
                            variant="outline"
                          >
                            Open
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
