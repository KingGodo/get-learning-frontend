"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiRequestError, subjectsApi } from "@/lib/api";
import type { Subject } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { PageLoading } from "@/components/ui/page-loading";

export default function SubjectsPage() {
  const { user } = useAuth();
  const isTeacher = user?.role === "TEACHER";
  const canManage = user?.role === "ADMIN" || isTeacher;
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [catalog, setCatalog] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      if (isTeacher) {
        const [mine, school] = await Promise.all([
          subjectsApi.list(),
          subjectsApi.schoolCatalog(),
        ]);
        setSubjects(mine);
        setCatalog(school);
      } else {
        setSubjects(await subjectsApi.list());
        setCatalog([]);
      }
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
  }, [isTeacher]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return subjects;
    return subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        (s.description?.toLowerCase().includes(q) ?? false),
    );
  }, [subjects, query]);

  const availableToJoin = useMemo(
    () => catalog.filter((s) => !s.isAssigned),
    [catalog],
  );

  async function onDelete(id: string, name: string) {
    if (
      !window.confirm(
        `Remove “${name}”? Classes using it cannot keep this subject.`,
      )
    ) {
      return;
    }
    setDeletingId(id);
    setActionError(null);
    try {
      await subjectsApi.remove(id);
      await load();
    } catch (err) {
      setActionError(
        err instanceof ApiRequestError ? err.message : "Could not delete",
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function onAssign(id: string) {
    setAssigningId(id);
    setActionError(null);
    try {
      await subjectsApi.assign(id);
      await load();
    } catch (err) {
      setActionError(
        err instanceof ApiRequestError ? err.message : "Could not add subject",
      );
    } finally {
      setAssigningId(null);
    }
  }

  async function onUnassign(id: string, name: string) {
    if (
      !window.confirm(
        `Stop teaching “${name}”? You can add it again later from the school catalog.`,
      )
    ) {
      return;
    }
    setDeletingId(id);
    setActionError(null);
    try {
      await subjectsApi.unassign(id);
      await load();
    } catch (err) {
      setActionError(
        err instanceof ApiRequestError ? err.message : "Could not remove",
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <PageLoading label="Loading subjects…" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
            Academics
          </p>
          <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-[#0C1A2E]">
            Subjects
          </h1>
          <p className="mt-1 text-[13px] text-zinc-500">
            {isTeacher
              ? "Register the subjects you teach — you can add as many as you need."
              : "Catalog used when creating classes across the platform."}
          </p>
        </div>

        {canManage && (
          <Link
            href="/subjects/new"
            className="inline-flex h-9 items-center gap-1.5 bg-[#0C1A2E] px-3.5 text-sm font-semibold text-white hover:bg-[#0C1A2E]/90"
          >
            <Plus className="size-3.5" />
            Add subject
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

      {actionError && (
        <div
          className="border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
          role="alert"
        >
          {actionError}
        </div>
      )}

      {subjects.length > 0 && (
        <div className="flex flex-wrap gap-x-10 gap-y-4 border-y border-zinc-200/70 py-5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">
              {isTeacher ? "Your subjects" : "Total"}
            </p>
            <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-[#0C1A2E]">
              {subjects.length}
            </p>
          </div>
        </div>
      )}

      {subjects.length > 0 && (
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-zinc-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, code, or description…"
            className="h-9 rounded-md border-zinc-200 bg-transparent pl-9 text-sm"
          />
        </div>
      )}

      {subjects.length === 0 ? (
        <div className="flex flex-col items-center px-2 py-10 text-center sm:py-14">
          <Image
            src="/subjects.svg"
            alt=""
            width={280}
            height={220}
            className="w-[min(70vw,240px)] select-none"
            priority
          />
          <h2 className="mt-6 text-base font-semibold text-[#0C1A2E]">
            {isTeacher ? "Register your subjects" : "No subjects yet"}
          </h2>
          <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-zinc-500">
            {isTeacher
              ? "Add subjects like Mathematics or Science, or join ones already at your school."
              : "Add subjects like Mathematics or Science before creating classes."}
          </p>
          {canManage && (
            <Link
              href="/subjects/new"
              className="mt-5 inline-flex h-9 items-center gap-1.5 bg-[#0C1A2E] px-3.5 text-sm font-semibold text-white hover:bg-[#0C1A2E]/90"
            >
              <Plus className="size-3.5" />
              Add subject
            </Link>
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-2 py-14 text-center">
          <p className="text-sm font-medium text-[#0C1A2E]">No matches</p>
          <p className="mt-1 text-[13px] text-zinc-500">
            Try another search term.
          </p>
        </div>
      ) : (
        <div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-b border-zinc-200/70 text-[11px] uppercase tracking-[0.08em] text-zinc-400">
                  <th className="py-3 pr-4 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  {canManage && (
                    <th className="py-3 pl-4 text-right font-medium">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-zinc-200/50 text-[13px] transition-colors hover:bg-zinc-200/30"
                  >
                    <td className="py-3.5 pr-4 font-medium text-[#0C1A2E]">
                      <Link
                        href={`/subjects/${s.id}`}
                        className="hover:underline"
                      >
                        {s.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-[12px] text-zinc-600">
                        {s.code}
                      </span>
                    </td>
                    <td className="max-w-xs px-4 py-3.5 text-zinc-500">
                      <span className="line-clamp-2">
                        {s.description || "—"}
                      </span>
                    </td>
                    {canManage && (
                      <td className="py-3.5 pl-4 text-right">
                        {isTeacher ? (
                          <button
                            type="button"
                            disabled={deletingId === s.id}
                            onClick={() => void onUnassign(s.id, s.name)}
                            className="text-[12px] font-medium text-zinc-400 transition-colors hover:text-red-600 disabled:opacity-50"
                          >
                            {deletingId === s.id ? "Removing…" : "Remove"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={deletingId === s.id}
                            onClick={() => void onDelete(s.id, s.name)}
                            className="text-[12px] font-medium text-zinc-400 transition-colors hover:text-red-600 disabled:opacity-50"
                          >
                            {deletingId === s.id ? "Removing…" : "Remove"}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pt-3 text-[12px] text-zinc-400">
            Showing {filtered.length} of {subjects.length} subject
            {subjects.length === 1 ? "" : "s"}
          </div>
        </div>
      )}

      {isTeacher && availableToJoin.length > 0 && (
        <section className="space-y-3 border-t border-zinc-200 pt-7">
          <div>
            <h2 className="text-sm font-semibold text-[#0C1A2E]">
              At your school
            </h2>
            <p className="mt-0.5 text-[12px] text-zinc-400">
              Join existing subjects without creating duplicates
            </p>
          </div>
          <ul className="divide-y divide-zinc-200 border-y border-zinc-200">
            {availableToJoin.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3.5"
              >
                <div>
                  <p className="text-[13px] font-medium text-[#0C1A2E]">
                    {s.name}
                  </p>
                  <p className="mt-0.5 font-mono text-[12px] text-zinc-500">
                    {s.code}
                    {s.description ? ` · ${s.description}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={assigningId === s.id}
                  onClick={() => void onAssign(s.id)}
                  className="text-[12px] font-semibold text-[#0C1A2E] transition-opacity hover:opacity-70 disabled:opacity-50"
                >
                  {assigningId === s.id ? "Adding…" : "Teach this"}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
