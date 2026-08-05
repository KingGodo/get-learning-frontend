"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiRequestError, schoolsApi } from "@/lib/api";
import type { AdminSchoolDetail } from "@/lib/types";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { StatStrip } from "@/components/ui/stat-strip";
import { StatusBadge, statusToneFor } from "@/components/ui/status-badge";

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-[12px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-[13px] text-ink">{value ?? "—"}</p>
    </div>
  );
}

function roleLabel(role: string) {
  if (role === "SCHOOL_ADMIN") return "School admin";
  return role.charAt(0) + role.slice(1).toLowerCase();
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
          className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-brand-dark"
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
          className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-brand-dark"
        >
          <ArrowLeft className="size-3.5" />
          Back to schools
        </Link>
        <PageHeader
          eyebrow="School detail"
          title={school.name}
          description={school.code}
          className="mt-4 pb-0"
          actions={
            <StatusBadge tone={statusToneFor(school.status ?? "")}>
              {school.status
                ? school.status.charAt(0) + school.status.slice(1).toLowerCase()
                : "—"}
            </StatusBadge>
          }
        />
      </div>

      <StatStrip
        items={[
          { label: "Users", value: school._count.users },
          { label: "Teachers", value: teachers.length },
          { label: "Students", value: students.length },
          { label: "Classes", value: school._count.classes },
        ]}
      />

      <section className="space-y-4">
        <h2 className="text-[12px] font-medium text-muted-foreground">Details</h2>
        <div className="grid gap-5 border-y border-border py-5 sm:grid-cols-2 lg:grid-cols-3">
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
        <h2 className="text-[12px] font-medium text-muted-foreground">
          People ({school.users.length})
        </h2>
        {school.users.length === 0 ? (
          <EmptyState
            title="No people yet"
            description="No users linked to this school yet."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-border text-[12px] text-muted-foreground">
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
                    className="border-b border-border/70 text-[13px] transition-colors hover:bg-muted/70"
                  >
                    <td className="py-3.5 pr-4 font-medium text-ink">
                      <Link
                        href={`/users/${u.id}`}
                        className="hover:underline"
                      >
                        {u.firstName} {u.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge>{roleLabel(u.role)}</StatusBadge>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {u.teacher?.employeeNumber ??
                        u.student?.studentNumber ??
                        "—"}
                      {u.teacher?.department
                        ? ` · ${u.teacher.department}`
                        : ""}
                    </td>
                    <td className="py-3.5 pl-4">
                      <StatusBadge tone={statusToneFor(u.status)}>
                        {u.status.charAt(0) + u.status.slice(1).toLowerCase()}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-[12px] font-medium text-muted-foreground">
          Classes ({school.classes.length})
        </h2>
        {school.classes.length === 0 ? (
          <EmptyState
            title="No classes yet"
            description="No classes at this school yet."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-border text-[12px] text-muted-foreground">
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
                    className="border-b border-border/70 text-[13px]"
                  >
                    <td className="py-3.5 pr-4 font-medium text-ink">
                      <Link
                        href={`/classes/${c.id}`}
                        className="hover:underline"
                      >
                        {c.name}
                      </Link>
                      <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                        {c.classCode}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {c.subject
                        ? `${c.subject.name} (${c.subject.code})`
                        : "—"}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-muted-foreground">
                      {c.academicYear} / {c.semester}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge tone={statusToneFor(c.status)}>
                        {c.status.charAt(0) + c.status.slice(1).toLowerCase()}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-muted-foreground">
                      {c._count.classStudents}
                    </td>
                    <td className="py-3.5 pl-4 text-right tabular-nums text-muted-foreground">
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
