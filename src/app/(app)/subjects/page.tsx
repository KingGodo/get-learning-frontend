"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  Plus,
  Search,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiRequestError, subjectsApi } from "@/lib/api";
import { toastFromError } from "@/lib/toast";
import type { Subject } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";

type SortMode = "name" | "code";

const PAGE_SIZE = 20;

function subjectInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export default function SubjectsPage() {
  const { user } = useAuth();
  const isTeacher = user?.role === "TEACHER";
  const canManage = user?.role === "SCHOOL_ADMIN" || user?.role === "ADMIN";
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("name");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmSubject, setConfirmSubject] = useState<Subject | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      setSubjects(await subjectsApi.list());
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Failed to load subjects",
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
    const filtered = subjects.filter((s) => {
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        (s.description?.toLowerCase().includes(q) ?? false)
      );
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sortMode === "code") {
        const byCode = a.code.localeCompare(b.code);
        if (byCode !== 0) return byCode;
        return a.name.localeCompare(b.name);
      }
      const byName = a.name.localeCompare(b.name);
      if (byName !== 0) return byName;
      return a.code.localeCompare(b.code);
    });
    return sorted;
  }, [subjects, query, sortMode]);

  const totalFiltered = filteredSorted.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredSorted.slice(start, start + PAGE_SIZE);
  }, [filteredSorted, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [query, sortMode]);

  function clearFilters() {
    setQuery("");
    setSortMode("name");
    setPage(1);
  }

  async function onDeleteConfirm() {
    if (!confirmSubject) return;
    setDeletingId(confirmSubject.id);
    try {
      await subjectsApi.remove(confirmSubject.id);
      setConfirmSubject(null);
      await load();
    } catch (err) {
      toastFromError(err, "Could not delete");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <PageLoading label="Loading subjects…" />;
  }

  const rangeStart =
    totalFiltered === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, totalFiltered);
  const confirming = deletingId !== null;

  const description =
    subjects.length === 0
      ? isTeacher
        ? "Subjects allocated to you by your school admin."
        : "Create subjects for your school, then assign them when adding teachers."
      : `${subjects.length} subject${subjects.length === 1 ? "" : "s"} in your catalog.`;

  return (
    <div className="flex min-h-[calc(100svh-8.5rem)] flex-col gap-6">
      <PageHeader
        eyebrow="Academics"
        title="Subjects"
        description={description}
        actions={
          canManage ? (
            <ButtonLink href="/subjects/new" size="sm">
              <Plus className="size-3.5" />
              Add subject
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

      {subjects.length > 0 && (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:p-3.5">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, code, or description…"
              className="h-9 rounded-md border-border bg-background pl-9 text-sm shadow-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-muted-foreground">
              Sort
            </span>
            <Select
              value={sortMode}
              onValueChange={(value) => {
                if (value === "name" || value === "code") setSortMode(value);
              }}
            >
              <SelectTrigger className="h-9 w-[140px] rounded-md border-border bg-background text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A–Z</SelectItem>
                <SelectItem value="code">Code A–Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {subjects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card">
          <EmptyState
            title={isTeacher ? "No subjects allocated" : "No subjects yet"}
            description={
              isTeacher
                ? "Your school admin will assign subjects and classes to your account."
                : "Add subjects like Mathematics or Science, then create classes under them in Setup."
            }
            action={
              canManage ? (
                <ButtonLink href="/subjects/new" size="sm">
                  <Plus className="size-3.5" />
                  Add subject
                </ButtonLink>
              ) : undefined
            }
          />
        </div>
      ) : totalFiltered === 0 ? (
        <div className="rounded-lg border border-border bg-card">
          <EmptyState
            title="No matches"
            description="Try a different search, or clear filters to see all subjects."
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
            {/* Mobile cards */}
            <ul className="divide-y divide-border sm:hidden">
              {pageItems.map((s) => (
                <li key={s.id} className="px-4 py-4">
                  <Link
                    href={`/subjects/${s.id}`}
                    className="flex items-start gap-3"
                  >
                    <span
                      className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-light text-[12px] font-semibold text-brand"
                      aria-hidden
                    >
                      {subjectInitials(s.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[15px] font-semibold tracking-tight text-ink">
                          {s.name}
                        </span>
                        <ChevronRight className="size-3.5 shrink-0 text-slate-300" />
                      </span>
                      <span className="mt-1 inline-flex items-center gap-1.5 font-mono text-[12px] text-muted-foreground">
                        <BookOpen className="size-3" strokeWidth={1.75} />
                        {s.code}
                      </span>
                      <p
                        className={cn(
                          "mt-2 line-clamp-2 text-[13px] leading-snug",
                          s.description
                            ? "text-slate-600"
                            : "text-muted-foreground",
                        )}
                      >
                        {s.description || "No description"}
                      </p>
                    </span>
                  </Link>
                  <div className="mt-3 flex gap-2 pl-[3.25rem]">
                    <ButtonLink
                      href={`/subjects/${s.id}`}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      Open
                    </ButtonLink>
                    {canManage && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={deletingId === s.id}
                        onClick={() => setConfirmSubject(s)}
                        className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Desktop table — shared column widths for header + body */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[640px] table-fixed border-collapse text-left">
                <colgroup>
                  <col className="w-[38%]" />
                  <col className="w-[14%]" />
                  <col className="w-[30%]" />
                  <col className="w-[18%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[11px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
                    <th className="px-5 py-2.5 font-medium">Subject</th>
                    <th className="px-5 py-2.5 font-medium">Code</th>
                    <th className="px-5 py-2.5 font-medium">Description</th>
                    <th className="px-5 py-2.5 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-border last:border-b-0 transition-colors duration-150 ease-craft hover:bg-muted/40"
                    >
                      <td className="px-5 py-3.5 align-middle">
                        <Link
                          href={`/subjects/${s.id}`}
                          className="flex min-w-0 items-center gap-3"
                        >
                          <span
                            className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand-light text-[11px] font-semibold text-brand"
                            aria-hidden
                          >
                            {subjectInitials(s.name)}
                          </span>
                          <span className="truncate text-[14px] font-semibold tracking-tight text-ink hover:text-brand">
                            {s.name}
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 align-middle">
                        <span className="inline-flex max-w-full truncate rounded-md border border-border bg-background px-2 py-1 font-mono text-[12px] font-medium text-ink tabular-nums">
                          {s.code}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 align-middle">
                        <p
                          className={cn(
                            "truncate text-[13px] leading-snug",
                            s.description
                              ? "text-slate-600"
                              : "text-muted-foreground",
                          )}
                        >
                          {s.description || "No description"}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 align-middle">
                        <div className="flex items-center justify-end gap-2">
                          <ButtonLink
                            href={`/subjects/${s.id}`}
                            size="sm"
                            variant="outline"
                          >
                            Open
                          </ButtonLink>
                          {canManage && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              disabled={deletingId === s.id}
                              onClick={() => setConfirmSubject(s)}
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
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

      <Dialog
        open={confirmSubject !== null}
        onOpenChange={(open) => {
          if (!open && !confirming) setConfirmSubject(null);
        }}
      >
        <DialogContent showCloseButton={!confirming}>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-ink">
              Remove subject?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-semibold text-ink">
                {confirmSubject?.name}
              </span>
              ? Classes using it cannot keep this subject.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmSubject(null)}
              disabled={confirming}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void onDeleteConfirm()}
              disabled={confirming}
            >
              {confirming ? "Removing…" : "Proceed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
