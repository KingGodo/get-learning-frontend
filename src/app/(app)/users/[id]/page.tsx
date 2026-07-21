"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiRequestError, usersApi } from "@/lib/api";
import type { AdminUserDetail } from "@/lib/types";
import { PageLoading } from "@/components/ui/page-loading";
import { cn } from "@/lib/utils";

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">
        {label}
      </p>
      <p className="mt-1.5 text-[13px] text-brand-dark">{value ?? "—"}</p>
    </div>
  );
}

export default function UserDetailPage() {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authUser) return;
    if (authUser.role !== "ADMIN") {
      router.replace("/dashboard");
      return;
    }

    usersApi
      .get(id)
      .then(setUser)
      .catch((err) =>
        setError(
          err instanceof ApiRequestError
            ? err.message
            : "Failed to load user",
        ),
      )
      .finally(() => setLoading(false));
  }, [authUser, id, router]);

  if (!authUser || authUser.role !== "ADMIN" || loading) {
    return <PageLoading label="Loading user…" />;
  }

  if (error || !user) {
    return (
      <div className="space-y-4">
        <Link
          href="/users"
          className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-brand-dark"
        >
          <ArrowLeft className="size-3.5" />
          Back to users
        </Link>
        <div
          className="border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
          role="alert"
        >
          {error ?? "User not found"}
        </div>
      </div>
    );
  }

  const fullName = [user.firstName, user.middleName, user.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/users"
          className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-brand-dark"
        >
          <ArrowLeft className="size-3.5" />
          Back to users
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
              User detail
            </p>
            <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-brand-dark">
              {fullName}
            </h1>
            <p className="mt-1 text-[13px] text-zinc-500">{user.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex bg-zinc-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
              {user.role}
            </span>
            <span
              className={cn(
                "inline-flex px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                user.status === "ACTIVE"
                  ? "bg-emerald-50/80 text-emerald-700"
                  : "bg-zinc-200/60 text-zinc-500",
              )}
            >
              {user.status}
            </span>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
          Personal
        </h2>
        <div className="grid gap-5 border-y border-zinc-200/70 py-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Full name" value={fullName} />
          <Field label="Email" value={user.email} />
          <Field label="Phone" value={user.phoneNumber} />
          <Field label="Gender" value={user.gender} />
          <Field
            label="Date of birth"
            value={
              user.dateOfBirth
                ? new Date(user.dateOfBirth).toLocaleDateString()
                : null
            }
          />
          <Field
            label="Last login"
            value={
              user.lastLogin
                ? new Date(user.lastLogin).toLocaleString()
                : "Never"
            }
          />
          <Field
            label="Joined"
            value={new Date(user.createdAt).toLocaleString()}
          />
          <Field
            label="Email verified"
            value={user.emailVerified ? "Yes" : "No"}
          />
          <Field
            label="Phone verified"
            value={user.phoneVerified ? "Yes" : "No"}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
          School
        </h2>
        {user.school ? (
          <div className="grid gap-5 border-y border-zinc-200/70 py-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Name"
              value={
                <Link
                  href={`/school/${user.school.id}`}
                  className="font-medium hover:underline"
                >
                  {user.school.name}
                </Link>
              }
            />
            <Field label="Code" value={user.school.code} />
            <Field label="Email" value={user.school.email} />
            <Field
              label="Location"
              value={`${user.school.city}, ${user.school.province}`}
            />
            <Field label="Status" value={user.school.status} />
          </div>
        ) : (
          <p className="border-y border-zinc-200/70 py-5 text-[13px] text-zinc-500">
            Not linked to a school.
          </p>
        )}
      </section>

      {user.teacher && (
        <section className="space-y-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
            Teacher profile
          </h2>
          <div className="grid gap-5 border-y border-zinc-200/70 py-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Employee number"
              value={user.teacher.employeeNumber}
            />
            <Field label="Department" value={user.teacher.department} />
            <Field
              label="Qualification"
              value={user.teacher.qualification}
            />
          </div>

          {user.teacher.classTeachers &&
            user.teacher.classTeachers.length > 0 && (
              <div className="overflow-x-auto pt-2">
                <table className="w-full min-w-[560px] text-left">
                  <thead>
                    <tr className="border-b border-zinc-200/70 text-[11px] uppercase tracking-[0.08em] text-zinc-400">
                      <th className="py-3 pr-4 font-medium">Class</th>
                      <th className="px-4 py-3 font-medium">Subject</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 text-right font-medium">
                        Students
                      </th>
                      <th className="py-3 pl-4 text-right font-medium">
                        Assignments
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.teacher.classTeachers.map((ct) => (
                      <tr
                        key={ct.class.id}
                        className="border-b border-zinc-200/50 text-[13px]"
                      >
                        <td className="py-3 pr-4 font-medium text-brand-dark">
                          {ct.class.name}
                          <span className="ml-2 font-mono text-[11px] text-zinc-400">
                            {ct.class.classCode}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-600">
                          {ct.class.subject
                            ? `${ct.class.subject.name} (${ct.class.subject.code})`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-zinc-500">
                          {ct.class.status}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-zinc-600">
                          {ct.class._count?.classStudents ?? 0}
                        </td>
                        <td className="py-3 pl-4 text-right tabular-nums text-zinc-600">
                          {ct.class._count?.assignments ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </section>
      )}

      {user.student && (
        <section className="space-y-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
            Student profile
          </h2>
          <div className="grid gap-5 border-y border-zinc-200/70 py-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Student number"
              value={user.student.studentNumber}
            />
            <Field label="Guardian" value={user.student.guardianName} />
            <Field label="Guardian phone" value={user.student.guardianPhone} />
            <Field
              label="Guardian email"
              value={user.student.guardianEmail}
            />
            <Field
              label="Emergency contact"
              value={user.student.emergencyContact}
            />
            <Field
              label="Submissions"
              value={user.student._count?.submissions ?? 0}
            />
          </div>

          {user.student.classStudents &&
            user.student.classStudents.length > 0 && (
              <div className="overflow-x-auto pt-2">
                <table className="w-full min-w-[480px] text-left">
                  <thead>
                    <tr className="border-b border-zinc-200/70 text-[11px] uppercase tracking-[0.08em] text-zinc-400">
                      <th className="py-3 pr-4 font-medium">Class</th>
                      <th className="px-4 py-3 font-medium">Subject</th>
                      <th className="py-3 pl-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.student.classStudents.map((cs) => (
                      <tr
                        key={cs.class.id}
                        className="border-b border-zinc-200/50 text-[13px]"
                      >
                        <td className="py-3 pr-4 font-medium text-brand-dark">
                          {cs.class.name}
                          <span className="ml-2 font-mono text-[11px] text-zinc-400">
                            {cs.class.classCode}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-600">
                          {cs.class.subject
                            ? `${cs.class.subject.name} (${cs.class.subject.code})`
                            : "—"}
                        </td>
                        <td className="py-3 pl-4 text-zinc-500">
                          {cs.class.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </section>
      )}
    </div>
  );
}
