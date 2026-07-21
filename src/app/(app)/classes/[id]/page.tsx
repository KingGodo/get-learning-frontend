"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, Copy } from "lucide-react";
import { ApiRequestError, classesApi } from "@/lib/api";
import type { ClassRoom } from "@/lib/types";
import { PageLoading } from "@/components/ui/page-loading";
import { cn } from "@/lib/utils";

export default function ClassDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<ClassRoom | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setError(null);
    setData(null);
    classesApi
      .get(params.id)
      .then(setData)
      .catch((err) =>
        setError(err instanceof ApiRequestError ? err.message : "Not found"),
      );
  }, [params.id]);

  useEffect(() => {
    if (!data || typeof window === "undefined") return;
    if (window.location.hash === "#students") {
      document.getElementById("students")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [data]);

  async function copyCode() {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.classCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Could not copy class code");
    }
  }

  if (error && !data) {
    return (
      <div className="space-y-4">
        <Link
          href="/classes"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-500 hover:text-brand-dark"
        >
          <ArrowLeft className="size-3.5" />
          Classes
        </Link>
        <div
          className="border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
          role="alert"
        >
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return <PageLoading label="Loading class…" />;
  }

  const students = data.classStudents ?? [];

  return (
    <div className="space-y-8">
      {error && (
        <div
          className="border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      <div>
        <Link
          href="/classes"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-500 transition-colors hover:text-brand-dark"
        >
          <ArrowLeft className="size-3.5" />
          Classes
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
              {data.subject ? (
                <Link
                  href={`/subjects/${data.subject.id}`}
                  className="hover:text-brand-dark"
                >
                  {data.subject.name}
                </Link>
              ) : (
                "Class"
              )}
            </p>
            <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-brand-dark">
              {data.name}
            </h1>
            {data.description && (
              <p className="mt-1.5 max-w-2xl text-[13px] text-zinc-500">
                {data.description}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={cn(
                  "inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  data.status === "ACTIVE"
                    ? "bg-emerald-50/80 text-emerald-700"
                    : "bg-zinc-200/60 text-zinc-500",
                )}
              >
                {data.status}
              </span>
              <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                {data.academicYear} · Sem {data.semester}
              </span>
              <a
                href="#students"
                className="inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-dark hover:underline"
              >
                {students.length} student{students.length === 1 ? "" : "s"}
              </a>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void copyCode()}
            className="inline-flex items-center gap-2 border border-zinc-200 bg-white px-3.5 py-2.5 font-mono text-[13px] text-brand-dark transition-colors hover:border-brand/30"
          >
            {data.classCode}
            {copied ? (
              <Check className="size-3.5 text-emerald-600" />
            ) : (
              <Copy className="size-3.5 text-zinc-400" />
            )}
            <span className="font-sans text-[11px] font-medium text-zinc-400">
              {copied ? "Copied" : "Copy"}
            </span>
          </button>
        </div>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-brand-dark">Teachers</h2>
        <ul className="mt-4 space-y-3 border-y border-zinc-200/70 py-4">
          {(data.classTeachers ?? []).length === 0 && (
            <li className="text-[13px] text-zinc-400">No teachers listed.</li>
          )}
          {(data.classTeachers ?? []).map((t, i) => (
            <li key={i} className="text-[13px]">
              <span className="font-medium text-brand-dark">
                {t.teacher.user.firstName} {t.teacher.user.lastName}
              </span>
              <span className="mt-0.5 block text-[12px] text-zinc-500">
                {t.teacher.user.email}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section id="students" className="scroll-mt-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-brand-dark">
            Students ({students.length})
          </h2>
          <p className="mt-0.5 text-[12px] text-zinc-500">
            Everyone enrolled in this class.
          </p>
        </div>

        {students.length === 0 ? (
          <p className="border-y border-zinc-200/70 py-5 text-[13px] text-zinc-400">
            No students yet. Share the class code so they can join.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-b border-zinc-200/70 text-[11px] uppercase tracking-[0.08em] text-zinc-400">
                  <th className="py-3 pr-4 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Student no.</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="py-3 pl-4 font-medium">Phone</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr
                    key={s.student.id ?? i}
                    className="border-b border-zinc-200/50 text-[13px]"
                  >
                    <td className="py-3.5 pr-4 font-medium text-brand-dark">
                      {s.student.user.firstName} {s.student.user.lastName}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[12px] text-zinc-600">
                      {s.student.studentNumber ?? "—"}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600">
                      {s.student.user.email}
                    </td>
                    <td className="py-3.5 pl-4 text-zinc-500">
                      {s.student.user.phoneNumber ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Link
        href={`/assignments?classId=${data.id}`}
        className="inline-flex h-9 items-center bg-brand-dark px-3.5 text-sm font-semibold text-white hover:bg-brand-dark/90"
      >
        View assignments
      </Link>
    </div>
  );
}
