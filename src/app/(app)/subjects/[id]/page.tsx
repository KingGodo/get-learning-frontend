"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ApiRequestError, subjectsApi } from "@/lib/api";
import type { SubjectDetail } from "@/lib/types";
import { PageLoading } from "@/components/ui/page-loading";

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
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-500 hover:text-[#0C1A2E]"
        >
          <ArrowLeft className="size-3.5" />
          Subjects
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
    return <PageLoading label="Loading subject…" />;
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/subjects"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-500 hover:text-[#0C1A2E]"
        >
          <ArrowLeft className="size-3.5" />
          Subjects
        </Link>
        <p className="mt-4 font-mono text-[12px] text-zinc-400">{data.code}</p>
        <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-[#0C1A2E]">
          {data.name}
        </h1>
        {data.description && (
          <p className="mt-1.5 max-w-2xl text-[13px] text-zinc-500">
            {data.description}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-x-10 gap-y-4 border-y border-zinc-200/70 py-5">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">
            Classes
          </p>
          <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-[#0C1A2E]">
            {data.classes.length}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">
            Students
          </p>
          <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-[#0C1A2E]">
            {data.students.length}
          </p>
        </div>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-[#0C1A2E]">Classes</h2>
          <p className="mt-0.5 text-[12px] text-zinc-500">
            Classes you teach for this subject.
          </p>
        </div>
        {data.classes.length === 0 ? (
          <p className="border-y border-zinc-200/70 py-5 text-[13px] text-zinc-400">
            No classes linked to this subject yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left">
              <thead>
                <tr className="border-b border-zinc-200/70 text-[11px] uppercase tracking-[0.08em] text-zinc-400">
                  <th className="py-3 pr-4 font-medium">Class</th>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Term</th>
                  <th className="px-4 py-3 text-right font-medium">Students</th>
                  <th className="py-3 pl-4 text-right font-medium">Work</th>
                </tr>
              </thead>
              <tbody>
                {data.classes.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-zinc-200/50 text-[13px]"
                  >
                    <td className="py-3.5 pr-4 font-medium text-[#0C1A2E]">
                      <Link
                        href={`/classes/${c.id}#students`}
                        className="hover:underline"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[12px] text-zinc-600">
                      {c.classCode}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-zinc-500">
                      {c.academicYear} · S{c.semester}
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-zinc-600">
                      <Link
                        href={`/classes/${c.id}#students`}
                        className="hover:underline"
                      >
                        {c._count.classStudents}
                      </Link>
                    </td>
                    <td className="py-3.5 pl-4 text-right tabular-nums text-zinc-600">
                      {c._count.assignments}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section id="students" className="scroll-mt-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-[#0C1A2E]">
            Students ({data.students.length})
          </h2>
          <p className="mt-0.5 text-[12px] text-zinc-500">
            Everyone enrolled in your classes for this subject.
          </p>
        </div>
        {data.students.length === 0 ? (
          <p className="border-y border-zinc-200/70 py-5 text-[13px] text-zinc-400">
            No students enrolled yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-zinc-200/70 text-[11px] uppercase tracking-[0.08em] text-zinc-400">
                  <th className="py-3 pr-4 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Student no.</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="py-3 pl-4 font-medium">Class</th>
                </tr>
              </thead>
              <tbody>
                {data.students.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-zinc-200/50 text-[13px]"
                  >
                    <td className="py-3.5 pr-4 font-medium text-[#0C1A2E]">
                      {s.firstName} {s.lastName}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[12px] text-zinc-600">
                      {s.studentNumber}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600">{s.email}</td>
                    <td className="px-4 py-3.5 text-zinc-500">
                      {s.phoneNumber || "—"}
                    </td>
                    <td className="py-3.5 pl-4 text-zinc-500">
                      {s.classes.map((c, i) => (
                        <span key={c.id}>
                          {i > 0 ? ", " : ""}
                          <Link
                            href={`/classes/${c.id}#students`}
                            className="hover:text-[#0C1A2E] hover:underline"
                          >
                            {c.name}
                          </Link>
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
