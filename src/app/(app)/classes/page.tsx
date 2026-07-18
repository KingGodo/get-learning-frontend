"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Copy, Plus, Search } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiRequestError, classesApi, setToken } from "@/lib/api";
import type { ClassRoom } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageLoading } from "@/components/ui/page-loading";
import { cn } from "@/lib/utils";

type StatusFilter = "ALL" | "ACTIVE" | "ARCHIVED";

export default function ClassesPage() {
  const { user, refreshUser } = useAuth();
  const isStudent = user?.role === "STUDENT";
  const canManage = user?.role === "TEACHER" || user?.role === "ADMIN";

  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return classes.filter((c) => {
      if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.classCode.toLowerCase().includes(q) ||
        (c.subject?.name?.toLowerCase().includes(q) ?? false) ||
        (c.subject?.code?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [classes, query, statusFilter]);

  const stats = useMemo(() => {
    const active = classes.filter((c) => c.status === "ACTIVE").length;
    const students = classes.reduce(
      (sum, c) => sum + (c._count?.classStudents ?? 0),
      0,
    );
    const assignments = classes.reduce(
      (sum, c) => sum + (c._count?.assignments ?? 0),
      0,
    );
    return { total: classes.length, active, students, assignments };
  }, [classes]);

  async function joinClass(e: React.FormEvent) {
    e.preventDefault();
    setJoining(true);
    setJoinError(null);
    try {
      const result = await classesApi.join(joinCode.trim().toUpperCase());
      setToken(result.token);
      await refreshUser();
      setJoinCode("");
      setLoading(true);
      await load();
    } catch (err) {
      setJoinError(
        err instanceof ApiRequestError ? err.message : "Could not join",
      );
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
      setError("Could not copy code");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
            Academics
          </p>
          <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-[#0C1A2E]">
            Classes
          </h1>
          <p className="mt-1 text-[13px] text-zinc-500">
            {isStudent
              ? "Join with a code and open your enrolled classes."
              : "Open a class to see student names, share codes, and track enrollment."}
          </p>
        </div>
        {canManage && (
          <Link
            href="/classes/new"
            className="inline-flex h-9 items-center gap-1.5 bg-[#0C1A2E] px-3.5 text-sm font-semibold text-white hover:bg-[#0C1A2E]/90"
          >
            <Plus className="size-3.5" />
            New class
          </Link>
        )}
      </div>

      {error && (
        <div
          className="border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      {!loading && classes.length > 0 && (
        <div className="flex flex-wrap gap-x-10 gap-y-4 border-y border-zinc-200/70 py-5">
          {[
            { label: "Total", value: stats.total },
            { label: "Active", value: stats.active },
            { label: "Students", value: stats.students },
            { label: "Assignments", value: stats.assignments },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">
                {s.label}
              </p>
              <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-[#0C1A2E]">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {isStudent && (
        <form
          onSubmit={joinClass}
          className="flex flex-col gap-3 border-b border-zinc-200/70 pb-5 sm:flex-row sm:items-end"
        >
          {joinError && (
            <div
              className="border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700 sm:col-span-2"
              role="alert"
            >
              {joinError}
            </div>
          )}
          <div className="flex-1 space-y-1.5">
            <Label
              htmlFor="classCode"
              className="text-[13px] font-medium text-zinc-600"
            >
              Join with class code
            </Label>
            <Input
              id="classCode"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="e.g. K3RKRBYC"
              className="h-9 rounded-md border-zinc-200 bg-transparent font-mono text-sm uppercase"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={joining}
            className="h-9 rounded-md bg-[#0C1A2E] px-5 text-sm font-semibold text-white hover:bg-[#0C1A2E]/90"
          >
            {joining ? "Joining…" : "Join class"}
          </Button>
        </form>
      )}

      {!loading && classes.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-zinc-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, subject, or code…"
              className="h-9 rounded-md border-zinc-200 bg-transparent pl-9 text-sm"
            />
          </div>
          <div className="flex gap-1">
            {(["ALL", "ACTIVE", "ARCHIVED"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "h-8 px-3 text-[12px] font-medium transition-colors",
                  statusFilter === status
                    ? "bg-[#0C1A2E] text-white"
                    : "text-zinc-500 hover:text-[#0C1A2E]",
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
        </div>
      )}

      {loading ? (
        <PageLoading label="Loading classes…" />
      ) : classes.length === 0 ? (
        <div className="flex flex-col items-center px-2 py-10 text-center sm:py-14">
          <Image
            src="/class.svg"
            alt=""
            width={280}
            height={220}
            className="w-[min(70vw,240px)] select-none"
            priority
          />
          <h2 className="mt-6 text-base font-semibold text-[#0C1A2E]">
            No classes yet
          </h2>
          <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-zinc-500">
            {isStudent
              ? "Ask your teacher for a class code, then join from the form above."
              : "Create your first class to invite students and publish assignments."}
          </p>
          {canManage && (
            <Link
              href="/classes/new"
              className="mt-5 inline-flex h-9 items-center gap-1.5 bg-[#0C1A2E] px-3.5 text-sm font-semibold text-white hover:bg-[#0C1A2E]/90"
            >
              <Plus className="size-3.5" />
              New class
            </Link>
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-2 py-14 text-center">
          <p className="text-sm font-medium text-[#0C1A2E]">No matches</p>
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
                  <th className="py-3 pr-4 font-medium">Class</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Term</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Students</th>
                  <th className="py-3 pl-4 text-right font-medium">Work</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-zinc-200/50 text-[13px] transition-colors hover:bg-zinc-200/30"
                  >
                    <td className="py-3.5 pr-4">
                      <Link
                        href={`/classes/${c.id}`}
                        className="font-medium text-[#0C1A2E] hover:underline"
                      >
                        {c.name}
                      </Link>
                      {c.description && (
                        <p className="mt-0.5 line-clamp-1 text-[11px] text-zinc-400">
                          {c.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600">
                      {c.subject ? (
                        <>
                          <span className="font-medium text-zinc-700">
                            {c.subject.code}
                          </span>
                          <span className="text-zinc-400"> · </span>
                          {c.subject.name}
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={(e) => void copyCode(c.classCode, e)}
                        className="inline-flex items-center gap-1.5 font-mono text-[12px] text-zinc-600 hover:text-[#0C1A2E]"
                        title="Copy class code"
                      >
                        {c.classCode}
                        <Copy className="size-3 opacity-50" />
                        {copiedCode === c.classCode && (
                          <span className="font-sans text-[11px] font-medium text-emerald-600">
                            Copied
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-zinc-500">
                      {c.academicYear} · S{c.semester}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={cn(
                          "inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          c.status === "ACTIVE"
                            ? "bg-emerald-50/80 text-emerald-700"
                            : "bg-zinc-200/60 text-zinc-500",
                        )}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-zinc-600">
                      <Link
                        href={`/classes/${c.id}#students`}
                        className="font-medium text-[#0C1A2E] hover:underline"
                        title="View student names"
                      >
                        {c._count?.classStudents ?? 0}
                        <span className="ml-1.5 text-[11px] font-normal text-zinc-400">
                          view
                        </span>
                      </Link>
                    </td>
                    <td className="py-3.5 pl-4 text-right tabular-nums text-zinc-600">
                      {c._count?.assignments ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pt-3 text-[12px] text-zinc-400">
            Showing {filtered.length} of {classes.length} class
            {classes.length === 1 ? "" : "es"}
          </div>
        </div>
      )}
    </div>
  );
}
