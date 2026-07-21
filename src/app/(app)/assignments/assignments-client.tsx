"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Search, ArrowRight, Paperclip } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiRequestError, assignmentsApi, classesApi } from "@/lib/api";
import type { Assignment, ClassRoom } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageLoading } from "@/components/ui/page-loading";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type StatusFilter = "ALL" | "DRAFT" | "PUBLISHED" | "CLOSED";

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((a) => {
      if (statusFilter !== "ALL" && a.status !== statusFilter) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        (a.class?.name?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [items, query, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
            Academics
          </p>
          <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-brand-dark">
            Assignments
          </h1>
          <p className="mt-1 max-w-lg text-[13px] text-zinc-500">
            {isStudent
              ? "Open an assignment to preview or download the teacher’s file, then submit your work."
              : "Publish work, set due dates, and collect submissions."}
          </p>
        </div>
        {canManage && <CreateAssignmentDialog onCreated={load} />}
      </div>

      {error && (
        <div
          className="border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-zinc-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or class…"
              className="h-9 rounded-md border-zinc-200 bg-transparent pl-9 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {(
              (isStudent
                ? (["ALL", "PUBLISHED", "CLOSED"] as const)
                : (["ALL", "PUBLISHED", "DRAFT", "CLOSED"] as const)
              )
            ).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "h-8 px-3 text-[12px] font-medium transition-colors",
                  statusFilter === status
                    ? "bg-brand text-brand-dark"
                    : "text-zinc-500 hover:text-brand-dark",
                )}
              >
                {status === "ALL"
                  ? "All"
                  : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <PageLoading label="Loading assignments…" />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center px-2 py-10 text-center sm:py-14">
          <Image
            src="/assignments.svg"
            alt=""
            width={280}
            height={220}
            className="w-[min(70vw,240px)] select-none"
            priority
          />
          <h2 className="mt-6 text-base font-semibold text-brand-dark">
            No assignments yet
          </h2>
          <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-zinc-500">
            {isStudent
              ? "When your teacher publishes work, it will show up here. Open it to preview files, download, and submit."
              : "Create an assignment for one of your classes to get started."}
          </p>
          {canManage && (
            <div className="mt-5">
              <CreateAssignmentDialog onCreated={load} />
            </div>
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-2 py-14 text-center">
          <p className="text-sm font-medium text-brand-dark">No matches</p>
          <p className="mt-1 text-[13px] text-zinc-500">
            Try another search or status filter.
          </p>
        </div>
      ) : (
        <div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-zinc-200/70 text-[11px] uppercase tracking-[0.08em] text-zinc-400">
                  <th className="py-3 pr-4 font-medium">Assignment</th>
                  <th className="px-4 py-3 font-medium">Class</th>
                  <th className="px-4 py-3 font-medium">Due</th>
                  <th className="px-4 py-3 font-medium">
                    {isStudent ? "Your work" : "Status"}
                  </th>
                  {!isStudent && (
                    <th className="px-4 py-3 font-medium">Submissions</th>
                  )}
                  <th className="py-3 pl-4 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => {
                  const due = new Date(a.dueDate);
                  const overdue =
                    isStudent &&
                    a.status === "PUBLISHED" &&
                    due.getTime() < Date.now() &&
                    !a.submissions?.[0];
                  const myStatus = a.submissions?.[0]?.status;

                  return (
                    <tr
                      key={a.id}
                      className="border-b border-zinc-200/50 text-[13px] transition-colors hover:bg-zinc-200/30"
                    >
                      <td className="py-3.5 pr-4">
                        <Link
                          href={`/assignments/${a.id}`}
                          className="font-medium text-brand-dark hover:underline"
                        >
                          {a.title}
                        </Link>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-zinc-400">
                          <span>{a.totalMarks} marks</span>
                          {a.attachment && (
                            <span className="inline-flex items-center gap-0.5 text-brand-dark/70">
                              <Paperclip className="size-3" />
                              File attached
                            </span>
                          )}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-zinc-600">
                        {a.class?.name ?? "—"}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-3.5 tabular-nums",
                          overdue ? "font-medium text-red-600" : "text-zinc-500",
                        )}
                      >
                        {due.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {overdue && (
                          <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-wide">
                            Overdue
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {isStudent ? (
                          <span
                            className={cn(
                              "inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                              myStatus === "GRADED"
                                ? "bg-emerald-50 text-emerald-700"
                                : myStatus === "SUBMITTED" ||
                                    myStatus === "LATE"
                                  ? "bg-sky-50 text-sky-700"
                                  : "bg-amber-50 text-amber-700",
                            )}
                          >
                            {myStatus ?? "Not submitted"}
                          </span>
                        ) : (
                          <span
                            className={cn(
                              "inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                              a.status === "PUBLISHED"
                                ? "bg-emerald-50/80 text-emerald-700"
                                : a.status === "DRAFT"
                                  ? "bg-amber-50/80 text-amber-700"
                                  : "bg-zinc-200/60 text-zinc-500",
                            )}
                          >
                            {a.status}
                          </span>
                        )}
                      </td>
                      {!isStudent && (
                        <td className="px-4 py-3.5 text-zinc-600">
                          {a._count?.submissions ?? 0}
                        </td>
                      )}
                      <td className="py-3.5 pl-4 text-right">
                        <Link
                          href={`/assignments/${a.id}`}
                          className="inline-flex h-8 items-center gap-1 bg-brand-dark px-3 text-[12px] font-semibold text-white transition-colors hover:bg-brand-dark/90"
                        >
                          {isStudent
                            ? myStatus
                              ? "View"
                              : "Open & submit"
                            : "Open"}
                          <ArrowRight className="size-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="pt-3 text-[12px] text-zinc-400">
            Showing {filtered.length} of {items.length} assignment
            {items.length === 1 ? "" : "s"}
          </div>
        </div>
      )}
    </div>
  );
}

function CreateAssignmentDialog({
  onCreated,
}: {
  onCreated: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [classId, setClassId] = useState("");
  const [allowLate, setAllowLate] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    instructions: "",
    dueDate: "",
    totalMarks: "100",
    status: "PUBLISHED",
  });

  useEffect(() => {
    if (!open) return;
    setError(null);
    classesApi
      .list()
      .then(setClasses)
      .catch(() => setError("Could not load classes"));
  }, [open]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!classId) {
      setError("Select a class");
      return;
    }
    setError(null);
    setPending(true);
    try {
      const fd = new FormData();
      fd.append("classId", classId);
      fd.append("title", form.title);
      fd.append("description", form.description);
      if (form.instructions) fd.append("instructions", form.instructions);
      fd.append("dueDate", new Date(form.dueDate).toISOString());
      fd.append("totalMarks", form.totalMarks);
      fd.append("allowLateSubmission", String(allowLate));
      fd.append("status", form.status);
      if (file) fd.append("attachment", file);
      await assignmentsApi.create(fd);
      setOpen(false);
      await onCreated();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Create failed",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="h-9 rounded-md bg-brand-dark text-sm font-semibold text-white hover:bg-brand-dark/90" />
        }
      >
        <Plus className="mr-1.5 size-3.5" />
        New assignment
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-semibold text-brand-dark">
            New assignment
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="relative space-y-3.5 pt-1">
          {pending && <PageLoading overlay label="Publishing assignment…" />}
          {error && (
            <div
              className="border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-[13px] text-zinc-600">Class</Label>
            <Select value={classId} onValueChange={(v) => setClassId(v ?? "")}>
              <SelectTrigger className="h-9 w-full rounded-md">
                <SelectValue placeholder="Choose class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-[13px] text-zinc-600">
              Title
            </Label>
            <Input
              id="title"
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="h-9 rounded-md"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-[13px] text-zinc-600">
              Description
            </Label>
            <Textarea
              id="description"
              required
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className="rounded-md"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="instructions" className="text-[13px] text-zinc-600">
              Instructions
            </Label>
            <Textarea
              id="instructions"
              value={form.instructions}
              onChange={(e) =>
                setForm((f) => ({ ...f, instructions: e.target.value }))
              }
              className="rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="due" className="text-[13px] text-zinc-600">
                Due date
              </Label>
              <Input
                id="due"
                type="datetime-local"
                required
                value={form.dueDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dueDate: e.target.value }))
                }
                className="h-9 rounded-md"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="marks" className="text-[13px] text-zinc-600">
                Total marks
              </Label>
              <Input
                id="marks"
                type="number"
                min={1}
                required
                value={form.totalMarks}
                onChange={(e) =>
                  setForm((f) => ({ ...f, totalMarks: e.target.value }))
                }
                className="h-9 rounded-md"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="late"
              checked={allowLate}
              onCheckedChange={(v) => setAllowLate(v === true)}
            />
            <Label htmlFor="late" className="text-[13px] text-zinc-600">
              Allow late submission
            </Label>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="file" className="text-[13px] text-zinc-600">
              Attachment (optional)
            </Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="h-9 rounded-md"
            />
          </div>
          <Button
            type="submit"
            disabled={pending}
            className="h-9 w-full rounded-md bg-brand-dark text-sm font-semibold text-white hover:bg-brand-dark/90"
          >
            {pending ? "Publishing…" : "Publish assignment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
