"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { ApiRequestError, submissionsApi } from "@/lib/api";
import type { Submission } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { PageLoading } from "@/components/ui/page-loading";
import { cn } from "@/lib/utils";

type StatusFilter = "ALL" | "SUBMITTED" | "LATE" | "GRADED";

function statusTone(status: string) {
  switch (status) {
    case "GRADED":
      return "bg-emerald-50/80 text-emerald-700";
    case "SUBMITTED":
      return "bg-sky-50/80 text-sky-700";
    case "LATE":
      return "bg-amber-50/80 text-amber-700";
    default:
      return "bg-zinc-200/60 text-zinc-500";
  }
}

export default function SubmissionsPage() {
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((s) => {
      if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
      if (!q) return true;
      const studentName = s.student?.user
        ? `${s.student.user.firstName} ${s.student.user.lastName}`.toLowerCase()
        : "";
      return (
        (s.assignment?.title?.toLowerCase().includes(q) ?? false) ||
        studentName.includes(q)
      );
    });
  }, [items, query, statusFilter]);

  if (loading) {
    return <PageLoading label="Loading submissions…" />;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div
          className="border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
          Academics
        </p>
        <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-brand-dark">
          Submissions
        </h1>
        <p className="mt-1 text-[13px] text-zinc-500">
          Student work across your assignments.
        </p>
      </div>

      {items.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-zinc-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by assignment or student…"
              className="h-9 rounded-md border-zinc-200 bg-transparent pl-9 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {(["ALL", "SUBMITTED", "LATE", "GRADED"] as const).map((status) => (
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

      {items.length === 0 ? (
        <div className="flex flex-col items-center px-2 py-10 text-center sm:py-14">
          <Image
            src="/submissions.svg"
            alt=""
            width={280}
            height={220}
            className="w-[min(70vw,240px)] select-none"
            priority
          />
          <h2 className="mt-6 text-base font-semibold text-brand-dark">
            No submissions yet
          </h2>
          <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-zinc-500">
            When students turn in work on your assignments, it will appear here.
          </p>
          <Link
            href="/assignments"
            className="mt-5 inline-flex h-9 items-center bg-brand-dark px-3.5 text-sm font-semibold text-white hover:bg-brand-dark/90"
          >
            Go to assignments
          </Link>
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
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-zinc-200/70 text-[11px] uppercase tracking-[0.08em] text-zinc-400">
                  <th className="py-3 pr-4 font-medium">Assignment</th>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="py-3 pl-4 text-right font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-zinc-200/50 text-[13px] transition-colors hover:bg-zinc-200/30"
                  >
                    <td className="py-3.5 pr-4">
                      {s.assignment?.id ? (
                        <Link
                          href={`/assignments/${s.assignment.id}`}
                          className="font-medium text-brand-dark hover:underline"
                        >
                          {s.assignment.title}
                        </Link>
                      ) : (
                        <span className="font-medium text-brand-dark">
                          Submission
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600">
                      {s.student?.user
                        ? `${s.student.user.firstName} ${s.student.user.lastName}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-zinc-500">
                      {new Date(s.submittedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={cn(
                          "inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          statusTone(s.status),
                        )}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 pl-4 text-right tabular-nums text-zinc-600">
                      {s.score != null ? s.score : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pt-3 text-[12px] text-zinc-400">
            Showing {filtered.length} of {items.length} submission
            {items.length === 1 ? "" : "s"}
          </div>
        </div>
      )}
    </div>
  );
}
