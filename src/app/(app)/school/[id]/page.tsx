"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiRequestError, schoolsApi } from "@/lib/api";
import type { AdminSchoolDetail } from "@/lib/types";
import { PageLoading } from "@/components/ui/page-loading";
import { cn } from "@/lib/utils";

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">
        {label}
      </p>
      <p className="mt-1.5 text-[13px] text-[#0C1A2E]">{value ?? "—"}</p>
    </div>
  );
}

export default function SchoolDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [school, setSchool] = useState<AdminSchoolDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "ADMIN") {
      router.replace("/school");
      return;
    }

    schoolsApi
      .get(id)
      .then(setSchool)
      .catch((err) =>
        setError(
          err instanceof ApiRequestError
            ? err.message
            : "Failed to load school",
        ),
      )
      .finally(() => setLoading(false));
  }, [user, id, router]);

  if (!user || user.role !== "ADMIN" || loading) {
    return <PageLoading label="Loading school…" />;
  }

  if (error || !school) {
    return (
      <div className="space-y-4">
        <Link
          href="/school"
          className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-[#0C1A2E]"
        >
          <ArrowLeft className="size-3.5" />
          Back to schools
        </Link>
        <div
          className="border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
          role="alert"
        >
          {error ?? "School not found"}
        </div>
      </div>
    );
  }

  const teachers = school.users.filter((u) => u.role === "TEACHER");
  const students = school.users.filter((u) => u.role === "STUDENT");

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/school"
          className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-[#0C1A2E]"
        >
          <ArrowLeft className="size-3.5" />
          Back to schools
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
              School detail
            </p>
            <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-[#0C1A2E]">
              {school.name}
            </h1>
            <p className="mt-1 font-mono text-[13px] text-zinc-500">
              {school.code}
            </p>
          </div>
          <span
            className={cn(
              "inline-flex px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
              school.status === "ACTIVE"
                ? "bg-emerald-50/80 text-emerald-700"
                : "bg-zinc-200/60 text-zinc-500",
            )}
          >
            {school.status}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-10 gap-y-4 border-y border-zinc-200/70 py-5">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">
            Users
          </p>
          <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-[#0C1A2E]">
            {school._count.users}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">
            Teachers
          </p>
          <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-[#0C1A2E]">
            {teachers.length}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">
            Students
          </p>
          <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-[#0C1A2E]">
            {students.length}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">
            Classes
          </p>
          <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-[#0C1A2E]">
            {school._count.classes}
          </p>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
          Details
        </h2>
        <div className="grid gap-5 border-y border-zinc-200/70 py-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Email" value={school.email} />
          <Field label="Phone" value={school.phoneNumber} />
          <Field
            label="Website"
            value={
              school.website ? (
                <a
                  href={school.website}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  {school.website}
                </a>
              ) : null
            }
          />
          <Field label="Address" value={school.address} />
          <Field label="City" value={school.city} />
          <Field label="Province" value={school.province} />
          <Field label="Country" value={school.country} />
          <Field
            label="Created"
            value={
              school.createdAt
                ? new Date(school.createdAt).toLocaleString()
                : null
            }
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
          People ({school.users.length})
        </h2>
        {school.users.length === 0 ? (
          <p className="border-y border-zinc-200/70 py-5 text-[13px] text-zinc-500">
            No users linked to this school yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-zinc-200/70 text-[11px] uppercase tracking-[0.08em] text-zinc-400">
                  <th className="py-3 pr-4 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">ID / Dept</th>
                  <th className="py-3 pl-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {school.users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-zinc-200/50 text-[13px] transition-colors hover:bg-zinc-200/30"
                  >
                    <td className="py-3.5 pr-4 font-medium text-[#0C1A2E]">
                      <Link
                        href={`/users/${u.id}`}
                        className="hover:underline"
                      >
                        {u.firstName} {u.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600">{u.email}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-500">
                      {u.teacher?.employeeNumber ??
                        u.student?.studentNumber ??
                        "—"}
                      {u.teacher?.department
                        ? ` · ${u.teacher.department}`
                        : ""}
                    </td>
                    <td className="py-3.5 pl-4">
                      <span
                        className={cn(
                          "inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          u.status === "ACTIVE"
                            ? "bg-emerald-50/80 text-emerald-700"
                            : "bg-zinc-200/60 text-zinc-500",
                        )}
                      >
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
          Classes ({school.classes.length})
        </h2>
        {school.classes.length === 0 ? (
          <p className="border-y border-zinc-200/70 py-5 text-[13px] text-zinc-500">
            No classes at this school yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-zinc-200/70 text-[11px] uppercase tracking-[0.08em] text-zinc-400">
                  <th className="py-3 pr-4 font-medium">Class</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Year / Sem</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Students</th>
                  <th className="py-3 pl-4 text-right font-medium">
                    Assignments
                  </th>
                </tr>
              </thead>
              <tbody>
                {school.classes.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-zinc-200/50 text-[13px]"
                  >
                    <td className="py-3.5 pr-4 font-medium text-[#0C1A2E]">
                      <Link
                        href={`/classes/${c.id}`}
                        className="hover:underline"
                      >
                        {c.name}
                      </Link>
                      <span className="ml-2 font-mono text-[11px] text-zinc-400">
                        {c.classCode}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600">
                      {c.subject
                        ? `${c.subject.name} (${c.subject.code})`
                        : "—"}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-zinc-500">
                      {c.academicYear} / {c.semester}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-500">{c.status}</td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-zinc-600">
                      {c._count.classStudents}
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
    </div>
  );
}
