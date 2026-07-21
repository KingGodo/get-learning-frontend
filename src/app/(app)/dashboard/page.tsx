"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiRequestError, dashboardApi } from "@/lib/api";
import type {
  AdminDashboard,
  Dashboard,
  SchoolAdminDashboard,
  StudentDashboard,
  TeacherDashboard,
} from "@/lib/types";
import { PageLoading } from "@/components/ui/page-loading";
import { cn } from "@/lib/utils";

function isAdminDash(d: Dashboard): d is AdminDashboard {
  return d.role === "ADMIN";
}

function isSchoolAdminDash(d: Dashboard): d is SchoolAdminDashboard {
  return d.role === "SCHOOL_ADMIN";
}

function isTeacherDash(d: Dashboard): d is TeacherDashboard {
  return d.role === "TEACHER";
}

function formatDue(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusTone(status: string) {
  switch (status) {
    case "GRADED":
      return "rounded-full bg-brand-light text-brand-dark";
    case "SUBMITTED":
      return "rounded-full bg-brand-muted text-brand-dark";
    case "LATE":
      return "rounded-full bg-[#fff5f5] text-[#c41e1e]";
    default:
      return "rounded-full bg-[#f5f7f8] text-[#5c6b6a]";
  }
}

const btnPrimary =
  "inline-flex h-9 items-center rounded-full bg-brand px-5 text-[13px] font-semibold text-brand-dark transition-colors hover:bg-brand-hover";
const btnSecondary =
  "inline-flex h-9 items-center rounded-full border border-zinc-200 bg-white px-5 text-[13px] font-semibold text-brand-dark transition-colors hover:border-brand/40 hover:bg-brand-light";
const btnPrimarySm =
  "inline-flex h-8 items-center rounded-full bg-brand px-4 text-[12px] font-semibold text-brand-dark transition-colors hover:bg-brand-hover";

function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-6 pb-2">
      <div className="max-w-2xl">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-brand-dark/55">
          {eyebrow}
        </p>
        <h1 className="mt-1.5 text-[1.75rem] font-semibold tracking-tight text-ink sm:text-[2rem]">
          {title}
        </h1>
        <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-zinc-500">
          {description}
        </p>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

function Metric({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href?: string;
}) {
  const content = (
    <>
      <p className="text-[13px] text-zinc-500">{label}</p>
      <p className="mt-3 text-[2rem] font-semibold tracking-tight text-ink">
        {value.toLocaleString()}
      </p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group rounded-2xl bg-white p-5 transition-colors hover:bg-[#fafafa]"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">{content}</div>
          <ArrowUpRight className="mt-1 size-4 text-zinc-300 transition-colors group-hover:text-brand-dark" />
        </div>
      </Link>
    );
  }

  return <div className="rounded-2xl bg-white p-5">{content}</div>;
}

function MetricStrip({
  items,
}: {
  items: Array<{ label: string; value: number; href?: string }>;
}) {
  return (
    <div
      className={cn(
        "grid gap-3",
        items.length <= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4",
      )}
    >
      {items.map((m) => (
        <Metric key={m.label} {...m} />
      ))}
    </div>
  );
}

function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl bg-white", className)}>
      <div className="flex items-center justify-between gap-3 px-5 pt-5">
        <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">
          {title}
        </h2>
        {action}
      </div>
      <div className="px-5 pb-2 pt-3">{children}</div>
    </section>
  );
}

function EmptyRow({ message }: { message: string }) {
  return (
    <p className="py-12 text-center text-[14px] text-zinc-400">{message}</p>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardApi
      .get()
      .then(setData)
      .catch((err) =>
        setError(
          err instanceof ApiRequestError ? err.message : "Failed to load",
        ),
      );
  }, []);

  if (error) {
    return (
      <div
        className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
        role="alert"
      >
        {error}
      </div>
    );
  }

  if (!data || !user) {
    return <PageLoading label="Loading dashboard…" />;
  }

  if (isAdminDash(data)) {
    return <AdminDashboardView name={user.firstName} data={data} />;
  }

  if (isSchoolAdminDash(data)) {
    return <SchoolAdminDashboardView name={user.firstName} data={data} />;
  }

  if (isTeacherDash(data)) {
    return <TeacherDashboardView data={data} />;
  }

  return <StudentDashboardView userName={user.firstName} data={data} />;
}

function AdminDashboardView({
  name,
  data,
}: {
  name: string;
  data: AdminDashboard;
}) {
  const metrics = [
    { label: "Schools", value: data.totalSchools, href: "/school" },
    { label: "Teachers", value: data.totalTeachers, href: "/users" },
    { label: "Students", value: data.totalStudents, href: "/users" },
    { label: "Classes", value: data.totalClasses },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System owner"
        title={`Good to see you, ${name}`}
        description="Schools and people across Learning Hub."
        actions={
          <>
            <Link href="/school/new" className={btnPrimary}>
              Create school
            </Link>
            <Link href="/users" className={btnSecondary}>
              View users
            </Link>
          </>
        }
      />

      <MetricStrip items={metrics} />

      <Panel
        title="Schools"
        action={
          <Link
            href="/school"
            className="text-[12px] font-semibold text-brand-dark hover:underline"
          >
            View all →
          </Link>
        }
      >

        {data.schools.length === 0 ? (
          <div className="flex flex-col items-center px-2 py-12 text-center">
            <Image
              src="/schools.svg"
              alt=""
              width={240}
              height={190}
              className="w-[min(60vw,220px)] select-none"
              priority
            />
            <h3 className="mt-6 text-base font-semibold text-zinc-900">
              No schools yet
            </h3>
            <p className="mt-1.5 max-w-sm text-[13px] text-zinc-500">
              Create the first school to start onboarding teachers and students.
            </p>
            <Link href="/school/new" className={cn(btnPrimary, "mt-5")}>
              Create school
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-zinc-200/70 text-[11px] uppercase tracking-[0.08em] text-zinc-400">
                  <th className="py-3 pr-4 font-medium">School</th>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">
                    Location
                  </th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Users</th>
                  <th className="py-3 pl-4 text-right font-medium">Classes</th>
                </tr>
              </thead>
              <tbody>
                {data.schools.map((school) => (
                  <tr
                    key={school.id}
                    className="border-b border-zinc-100 text-[13px] transition-colors hover:bg-brand-light/60"
                  >
                    <td className="py-3.5 pr-4 font-medium text-zinc-900">
                      <Link
                        href={`/school/${school.id}`}
                        className="hover:text-brand-dark hover:underline"
                      >
                        {school.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[12px] text-zinc-600">
                      {school.code}
                    </td>
                    <td className="hidden px-4 py-3.5 text-zinc-500 sm:table-cell">
                      {school.city}, {school.province}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={cn(
                          "inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          school.status === "ACTIVE"
                            ? "bg-brand-light text-brand-dark"
                            : "bg-zinc-100 text-zinc-500",
                        )}
                      >
                        {school.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-zinc-600">
                      {school._count.users}
                    </td>
                    <td className="py-3.5 pl-4 text-right tabular-nums text-zinc-600">
                      {school._count.classes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel
        title="Recent teachers"
        action={
          <Link
            href="/users"
            className="text-[12px] font-semibold text-brand-dark hover:underline"
          >
            All users
          </Link>
        }
      >
        {data.recentTeachers.length === 0 ? (
          <EmptyRow message="No teachers yet." />
        ) : (
          <ul>
            {data.recentTeachers.map((t) => (
              <li
                key={t.id}
                className="flex items-start justify-between gap-3 border-t border-slate-100 py-3.5 first:border-t-0"
              >
                <div>
                  <p className="text-[13px] font-medium text-ink">
                    {t.user.firstName} {t.user.lastName}
                  </p>
                  <p className="mt-0.5 text-[12px] text-slate-500">
                    {t.user.email}
                  </p>
                </div>
                <p className="shrink-0 text-[12px] text-slate-400">
                  {t.user.school?.name ?? "—"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function SchoolAdminDashboardView({
  name,
  data,
}: {
  name: string;
  data: SchoolAdminDashboard;
}) {
  const metrics = [
    { label: "Teachers", value: data.totalTeachers, href: "/users" },
    { label: "Students", value: data.totalStudents, href: "/users" },
    { label: "Classes", value: data.totalClasses },
    { label: "Subjects", value: data.totalSubjects },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={data.school?.name ?? "School admin"}
        title={`Good to see you, ${name}`}
        description="Create teacher and student accounts, then share login credentials."
        actions={
          <>
            <Link href="/users/new/teacher" className={btnPrimary}>
              Add teacher
            </Link>
            <Link href="/users/new/student" className={btnSecondary}>
              Add student
            </Link>
          </>
        }
      />

      <MetricStrip items={metrics} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Recent teachers"
          action={
            <Link
              href="/users"
              className="text-[12px] font-semibold text-brand-dark hover:underline"
            >
              All people
            </Link>
          }
        >
          {data.recentTeachers.length === 0 ? (
            <EmptyRow message="No teachers yet." />
          ) : (
            <ul>
              {data.recentTeachers.map((t) => (
                <li
                  key={t.id}
                  className="flex items-start justify-between gap-3 border-t border-slate-100 py-3.5 first:border-t-0"
                >
                  <div>
                    <p className="text-[13px] font-medium text-ink">
                      {t.user.firstName} {t.user.lastName}
                    </p>
                    <p className="mt-0.5 text-[12px] text-slate-500">
                      {t.user.email}
                    </p>
                  </div>
                  <p className="shrink-0 font-mono text-[12px] text-slate-400">
                    {t.employeeNumber}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Recent students"
          action={
            <Link
              href="/users"
              className="text-[12px] font-semibold text-brand-dark hover:underline"
            >
              All people
            </Link>
          }
        >
          {data.recentStudents.length === 0 ? (
            <EmptyRow message="No students yet." />
          ) : (
            <ul>
              {data.recentStudents.map((s) => (
                <li
                  key={s.id}
                  className="flex items-start justify-between gap-3 border-t border-slate-100 py-3.5 first:border-t-0"
                >
                  <div>
                    <p className="text-[13px] font-medium text-ink">
                      {s.user.firstName} {s.user.lastName}
                    </p>
                    <p className="mt-0.5 text-[12px] text-slate-500">
                      {s.user.email}
                    </p>
                  </div>
                  <p className="shrink-0 font-mono text-[12px] text-slate-400">
                    {s.studentNumber}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function TeacherDashboardView({ data }: { data: TeacherDashboard }) {
  const needsSubjects = data.totalSubjects === 0;
  const needsClasses = data.totalClasses === 0;
  const nextStep = needsSubjects
    ? {
        href: "/subjects/new",
        label: "Add a subject",
        hint: "Create a subject before opening a class.",
      }
    : needsClasses
      ? {
          href: "/classes/new",
          label: "Create a class",
          hint: "Open a class so students can join with a code.",
        }
      : null;

  const metrics = [
    { label: "Classes", value: data.totalClasses, href: "/classes" },
    { label: "Students", value: data.totalStudents, href: "/classes" },
    { label: "Assignments", value: data.totalAssignments, href: "/assignments" },
    { label: "To grade", value: data.pendingGrading, href: "/submissions" },
  ];

  const pending = data.recentSubmissions.filter(
    (s) => s.status === "SUBMITTED" || s.status === "LATE",
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={data.school?.name ?? "Teaching"}
        title={`Hello, ${data.profile.firstName}`}
        description="Here’s what needs your attention today."
        actions={
          needsSubjects || needsClasses ? (
            <>
              <Link href="/subjects/new" className={btnPrimary}>
                Add subject
              </Link>
              <Link href="/classes/new" className={btnSecondary}>
                Create class
              </Link>
            </>
          ) : (
            <Link href="/assignments" className={btnPrimary}>
              Assignments
            </Link>
          )
        }
      />

      {nextStep && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand/25 bg-brand-light px-5 py-4">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-brand-dark/70">
              Next step
            </p>
            <p className="mt-1 text-[15px] text-ink">{nextStep.hint}</p>
          </div>
          <Link href={nextStep.href} className={btnPrimarySm}>
            {nextStep.label}
          </Link>
        </div>
      )}

      {data.pendingGrading > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" aria-hidden />
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-brand-dark/70">
                Needs grading
              </p>
              <p className="mt-1 text-[15px] font-medium text-ink">
                {data.pendingGrading} submission
                {data.pendingGrading === 1 ? "" : "s"} waiting
              </p>
            </div>
          </div>
          <Link href="/submissions" className={btnPrimarySm}>
            Grade now
          </Link>
        </div>
      )}

      <MetricStrip items={metrics} />

      {data.classes.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">
                Students by class
              </h2>
              <p className="mt-0.5 text-[12px] text-zinc-500">
                Who is enrolled — open a class for the full roster.
              </p>
            </div>
            <Link
              href="/classes"
              className="text-[12px] font-semibold text-brand-dark hover:underline"
            >
              All classes →
            </Link>
          </div>
          <ul className="overflow-hidden rounded-2xl bg-white">
            {data.classes.map((cls) => {
              const names = (cls.classStudents ?? []).map(
                (row) =>
                  `${row.student.user.firstName} ${row.student.user.lastName}`,
              );
              const total = cls._count.classStudents;
              const extra = Math.max(0, total - names.length);

              return (
                <li
                  key={cls.id}
                  className="flex flex-col gap-2 border-t border-[#f5f5f7] px-5 py-4 first:border-t-0 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/classes/${cls.id}#students`}
                      className="text-[13px] font-medium text-zinc-900 hover:text-brand-dark hover:underline"
                    >
                      {cls.name}
                    </Link>
                    <p className="mt-0.5 text-[12px] text-zinc-500">
                      {cls.subject?.name ?? "Subject"} · {total} student
                      {total === 1 ? "" : "s"}
                    </p>
                    {total === 0 ? (
                      <p className="mt-2 text-[13px] text-zinc-400">
                        No students yet — share code{" "}
                        <span className="font-mono text-zinc-500">
                          {cls.classCode}
                        </span>
                      </p>
                    ) : (
                      <p className="mt-2 text-[13px] text-zinc-600">
                        {names.join(", ")}
                        {extra > 0 ? (
                          <Link
                            href={`/classes/${cls.id}#students`}
                            className="ml-1 font-medium text-brand-dark hover:underline"
                          >
                            +{extra} more
                          </Link>
                        ) : null}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/classes/${cls.id}#students`}
                    className="shrink-0 text-[12px] font-semibold text-brand-dark hover:underline"
                  >
                    View roster →
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Upcoming deadlines"
          action={
            <Link
              href="/assignments"
              className="text-[12px] font-semibold text-brand-dark hover:underline"
            >
              See all
            </Link>
          }
        >
          {data.upcomingDeadlines.length === 0 ? (
            <EmptyRow message="Nothing due soon." />
          ) : (
            <ul>
              {data.upcomingDeadlines.map((a) => (
                <li
                  key={a.id}
                  className="flex items-start justify-between gap-3 border-t border-zinc-100 py-3 first:border-t-0"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/assignments/${a.id}`}
                      className="text-[13px] font-medium text-zinc-900 hover:text-brand-dark hover:underline"
                    >
                      {a.title}
                    </Link>
                    <p className="mt-0.5 text-[12px] text-zinc-500">
                      {a.class?.name ?? "Class"}
                    </p>
                  </div>
                  <time className="shrink-0 text-[12px] tabular-nums text-zinc-500">
                    {formatDue(a.dueDate)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Recent to grade"
          action={
            <Link
              href="/submissions"
              className="text-[12px] font-semibold text-brand-dark hover:underline"
            >
              View all
            </Link>
          }
        >
          {pending.length === 0 ? (
            <EmptyRow message="No submissions waiting." />
          ) : (
            <ul>
              {pending.slice(0, 5).map((s) => (
                <li
                  key={s.id}
                  className="flex items-start justify-between gap-3 border-t border-zinc-100 py-3 first:border-t-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-zinc-900">
                      {s.assignment?.title ?? "Submission"}
                    </p>
                    <p className="mt-0.5 text-[12px] text-zinc-500">
                      {s.student
                        ? `${s.student.user.firstName} ${s.student.user.lastName}`
                        : formatDue(s.submittedAt)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      statusTone(s.status),
                    )}
                  >
                    {s.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function StudentDashboardView({
  userName,
  data,
}: {
  userName: string;
  data: StudentDashboard;
}) {
  const metrics = [
    { label: "Classes", value: data.joinedClasses, href: "/classes" },
    {
      label: "To do",
      value: data.activeAssignments,
      href: "/assignments",
    },
    {
      label: "Due soon",
      value: data.upcomingDeadlines.length,
      href: "/assignments",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Learning overview"
        title={`Hello, ${userName}`}
        description="See what’s still due, and catch up on work you’ve already submitted."
        actions={
          <>
            <Link href="/classes" className={btnPrimary}>
              My classes
            </Link>
            <Link href="/assignments" className={btnSecondary}>
              Assignments
            </Link>
          </>
        }
      />

      <MetricStrip items={metrics} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Still to submit"
          action={
            <Link
              href="/assignments"
              className="text-[12px] font-semibold text-brand-dark hover:underline"
            >
              See all
            </Link>
          }
        >
          {data.upcomingDeadlines.length === 0 ? (
            <EmptyRow message="You're caught up — nothing waiting." />
          ) : (
            <ul>
              {data.upcomingDeadlines.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-3 border-t border-zinc-100 py-3 first:border-t-0"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/assignments/${a.id}`}
                      className="text-[13px] font-medium text-zinc-900 hover:text-brand-dark hover:underline"
                    >
                      {a.title}
                    </Link>
                    <p className="mt-0.5 text-[11px] text-zinc-400">
                      {a.class?.name ?? "Class"}
                    </p>
                  </div>
                  <time className="shrink-0 text-[12px] tabular-nums text-zinc-500">
                    Due {formatDue(a.dueDate)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Already submitted"
          action={
            <Link
              href="/submissions"
              className="text-[12px] font-semibold text-brand-dark hover:underline"
            >
              See all
            </Link>
          }
        >
          {data.recentSubmissions.length === 0 ? (
            <EmptyRow message="No submissions yet." />
          ) : (
            <ul>
              {data.recentSubmissions.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 border-t border-zinc-100 py-3 first:border-t-0"
                >
                  <div className="min-w-0">
                    <Link
                      href={
                        s.assignment?.id
                          ? `/assignments/${s.assignment.id}`
                          : "/submissions"
                      }
                      className="truncate text-[13px] font-medium text-zinc-900 hover:text-brand-dark hover:underline"
                    >
                      {s.assignment?.title ?? "Submission"}
                    </Link>
                    <p className="mt-0.5 text-[11px] text-zinc-400">
                      Submitted {formatDue(s.submittedAt)}
                      {s.score != null ? ` · Score ${s.score}` : ""}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      statusTone(s.status),
                    )}
                  >
                    {s.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
