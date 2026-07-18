"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiRequestError, dashboardApi } from "@/lib/api";
import type {
  AdminDashboard,
  Dashboard,
  StudentDashboard,
  TeacherDashboard,
} from "@/lib/types";
import { PageLoading } from "@/components/ui/page-loading";
import { cn } from "@/lib/utils";

function isAdminDash(d: Dashboard): d is AdminDashboard {
  return d.role === "ADMIN";
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
      return "text-emerald-700 bg-emerald-50";
    case "SUBMITTED":
      return "text-sky-700 bg-sky-50";
    case "LATE":
      return "text-amber-700 bg-amber-50";
    default:
      return "text-zinc-600 bg-zinc-100";
  }
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
        className="border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
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

  if (isTeacherDash(data)) {
    return <TeacherDashboardView data={data} />;
  }

  return (
    <StudentDashboardView userName={user.firstName} data={data} />
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
  const body = (
    <>
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">
        {label}
      </p>
      <p className="mt-3 font-display text-[1.75rem] font-semibold tracking-tight text-[#0C1A2E]">
        {value.toLocaleString()}
      </p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group border border-zinc-200/80 bg-white px-4 py-4 transition-colors hover:border-zinc-300"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">{body}</div>
          <ArrowUpRight className="size-3.5 text-zinc-300 transition-colors group-hover:text-[#0C1A2E]" />
        </div>
      </Link>
    );
  }

  return (
    <div className="border border-zinc-200/80 bg-white px-4 py-4">{body}</div>
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
    <section
      className={cn(
        "border border-zinc-200/80 bg-white",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3">
        <h2 className="text-[13px] font-semibold text-[#0C1A2E]">{title}</h2>
        {action}
      </div>
      <div className="px-4 py-1">{children}</div>
    </section>
  );
}

function EmptyRow({ message }: { message: string }) {
  return (
    <p className="py-8 text-center text-[13px] text-zinc-400">{message}</p>
  );
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
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
            System owner
          </p>
          <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-[#0C1A2E]">
            Good to see you, {name}
          </h1>
          <p className="mt-1 text-[13px] text-zinc-500">
            Schools and people across the Lumen platform.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/school/new"
            className="inline-flex h-9 items-center bg-[#0C1A2E] px-3.5 text-[12px] font-semibold text-white hover:bg-[#0C1A2E]/90"
          >
            Create school
          </Link>
          <Link
            href="/users"
            className="inline-flex h-9 items-center border border-zinc-200 px-3.5 text-[12px] font-semibold text-[#0C1A2E] hover:bg-zinc-200/40"
          >
            View users
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-10 gap-y-4 border-y border-zinc-200/70 py-5">
        {metrics.map((m) =>
          m.href ? (
            <Link key={m.label} href={m.href} className="hover:opacity-80">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">
                {m.label}
              </p>
              <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-[#0C1A2E]">
                {m.value.toLocaleString()}
              </p>
            </Link>
          ) : (
            <div key={m.label}>
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">
                {m.label}
              </p>
              <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-[#0C1A2E]">
                {m.value.toLocaleString()}
              </p>
            </div>
          ),
        )}
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[#0C1A2E]">Schools</h2>
            <p className="mt-0.5 text-[12px] text-zinc-500">
              {data.schools.length} on the platform
            </p>
          </div>
          <Link
            href="/school"
            className="text-[12px] font-semibold text-[#0C1A2E] hover:underline"
          >
            View all →
          </Link>
        </div>

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
            <h3 className="mt-6 text-base font-semibold text-[#0C1A2E]">
              No schools yet
            </h3>
            <p className="mt-1.5 max-w-sm text-[13px] text-zinc-500">
              Create the first school to start onboarding teachers and students.
            </p>
            <Link
              href="/school/new"
              className="mt-5 inline-flex h-9 items-center bg-[#0C1A2E] px-3.5 text-sm font-semibold text-white hover:bg-[#0C1A2E]/90"
            >
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
                    className="border-b border-zinc-200/50 text-[13px] transition-colors hover:bg-zinc-200/30"
                  >
                    <td className="py-3.5 pr-4 font-medium text-[#0C1A2E]">
                      <Link
                        href={`/school/${school.id}`}
                        className="hover:underline"
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
                            ? "bg-emerald-50/80 text-emerald-700"
                            : "bg-zinc-200/60 text-zinc-500",
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
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold text-[#0C1A2E]">
            Recent teachers
          </h2>
          <Link
            href="/users"
            className="text-[12px] font-medium text-zinc-400 hover:text-[#0C1A2E]"
          >
            All users
          </Link>
        </div>
        {data.recentTeachers.length === 0 ? (
          <p className="text-[13px] text-zinc-400">No teachers yet.</p>
        ) : (
          <ul>
            {data.recentTeachers.map((t) => (
              <li
                key={t.id}
                className="flex items-start justify-between gap-3 border-b border-zinc-200/50 py-3 first:pt-0"
              >
                <div>
                  <p className="text-[13px] font-medium text-[#0C1A2E]">
                    {t.user.firstName} {t.user.lastName}
                  </p>
                  <p className="mt-0.5 text-[12px] text-zinc-500">
                    {t.user.email}
                  </p>
                </div>
                <p className="shrink-0 text-[12px] text-zinc-400">
                  {t.user.school?.name ?? "—"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
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
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
            {data.school?.name ?? "Teaching"}
          </p>
          <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-[#0C1A2E]">
            Hello, {data.profile.firstName}
          </h1>
          <p className="mt-1 text-[13px] text-zinc-500">
            What needs your attention today.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {needsSubjects || needsClasses ? (
            <>
              <Link
                href="/subjects/new"
                className="inline-flex h-9 items-center bg-[#0C1A2E] px-3.5 text-[12px] font-semibold text-white hover:bg-[#0C1A2E]/90"
              >
                Add subject
              </Link>
              <Link
                href="/classes/new"
                className="inline-flex h-9 items-center border border-zinc-200 bg-white px-3.5 text-[12px] font-semibold text-[#0C1A2E] hover:bg-zinc-50"
              >
                Create class
              </Link>
            </>
          ) : (
            <Link
              href="/assignments"
              className="inline-flex h-9 items-center bg-[#0C1A2E] px-3.5 text-[12px] font-semibold text-white hover:bg-[#0C1A2E]/90"
            >
              Assignments
            </Link>
          )}
        </div>
      </div>

      {nextStep && (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-zinc-200 bg-white px-4 py-3.5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
              Next step
            </p>
            <p className="mt-1 text-sm text-[#0C1A2E]">{nextStep.hint}</p>
          </div>
          <Link
            href={nextStep.href}
            className="inline-flex h-8 items-center bg-[#0C1A2E] px-3 text-[12px] font-semibold text-white hover:bg-[#0C1A2E]/90"
          >
            {nextStep.label}
          </Link>
        </div>
      )}

      {data.pendingGrading > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0C1A2E] px-4 py-3.5 text-white">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/50">
              Needs grading
            </p>
            <p className="mt-1 text-sm font-medium">
              {data.pendingGrading} submission
              {data.pendingGrading === 1 ? "" : "s"} waiting
            </p>
          </div>
          <Link
            href="/submissions"
            className="inline-flex h-8 items-center bg-white px-3 text-[12px] font-semibold text-[#0C1A2E] hover:bg-zinc-100"
          >
            Grade now
          </Link>
        </div>
      )}

      <div className="flex flex-wrap gap-x-10 gap-y-4 border-y border-zinc-200/70 py-5">
        {metrics.map((m) => (
          <Link key={m.label} href={m.href} className="hover:opacity-80">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">
              {m.label}
            </p>
            <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-[#0C1A2E]">
              {m.value.toLocaleString()}
            </p>
          </Link>
        ))}
      </div>

      {data.classes.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[#0C1A2E]">
                Students by class
              </h2>
              <p className="mt-0.5 text-[12px] text-zinc-500">
                Who is enrolled — open a class for the full roster.
              </p>
            </div>
            <Link
              href="/classes"
              className="text-[12px] font-semibold text-[#0C1A2E] hover:underline"
            >
              All classes →
            </Link>
          </div>
          <ul className="divide-y divide-zinc-200/70 border-y border-zinc-200/70">
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
                  className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/classes/${cls.id}#students`}
                      className="text-[13px] font-medium text-[#0C1A2E] hover:underline"
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
                            className="ml-1 font-medium text-[#0C1A2E] hover:underline"
                          >
                            +{extra} more
                          </Link>
                        ) : null}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/classes/${cls.id}#students`}
                    className="shrink-0 text-[12px] font-semibold text-[#0C1A2E] hover:underline"
                  >
                    View roster →
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold text-[#0C1A2E]">
              Upcoming deadlines
            </h2>
            <Link
              href="/assignments"
              className="text-[12px] font-medium text-zinc-400 hover:text-[#0C1A2E]"
            >
              See all
            </Link>
          </div>
          {data.upcomingDeadlines.length === 0 ? (
            <p className="text-[13px] text-zinc-400">Nothing due soon.</p>
          ) : (
            <ul>
              {data.upcomingDeadlines.map((a) => (
                <li
                  key={a.id}
                  className="flex items-start justify-between gap-3 border-b border-zinc-200/50 py-3 first:pt-0"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/assignments/${a.id}`}
                      className="text-[13px] font-medium text-[#0C1A2E] hover:underline"
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
        </section>

        <section>
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold text-[#0C1A2E]">
              Recent to grade
            </h2>
            <Link
              href="/submissions"
              className="text-[12px] font-medium text-zinc-400 hover:text-[#0C1A2E]"
            >
              View all
            </Link>
          </div>
          {pending.length === 0 ? (
            <p className="text-[13px] text-zinc-400">
              No submissions waiting.
            </p>
          ) : (
            <ul>
              {pending.slice(0, 5).map((s) => (
                <li
                  key={s.id}
                  className="flex items-start justify-between gap-3 border-b border-zinc-200/50 py-3 first:pt-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-[#0C1A2E]">
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
        </section>
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
            Learning overview
          </p>
          <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-[#0C1A2E]">
            Hello, {userName}
          </h1>
          <p className="mt-1 text-[13px] text-zinc-500">
            What’s left to do, and what you’ve already turned in.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/classes"
            className="inline-flex h-9 items-center bg-[#0C1A2E] px-3.5 text-[12px] font-semibold text-white hover:bg-[#0C1A2E]/90"
          >
            My classes
          </Link>
          <Link
            href="/assignments"
            className="inline-flex h-9 items-center border border-zinc-200 bg-white px-3.5 text-[12px] font-semibold text-[#0C1A2E] hover:bg-zinc-50"
          >
            Assignments
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {metrics.map((m) => (
          <Metric key={m.label} {...m} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Still to submit"
          action={
            <Link
              href="/assignments"
              className="text-[12px] font-medium text-zinc-400 hover:text-[#0C1A2E]"
            >
              See all
            </Link>
          }
        >
          {data.upcomingDeadlines.length === 0 ? (
            <EmptyRow message="You’re caught up — nothing waiting." />
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
                      className="text-[13px] font-medium text-[#0C1A2E] hover:underline"
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
              className="text-[12px] font-medium text-zinc-400 hover:text-[#0C1A2E]"
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
                      className="truncate text-[13px] font-medium text-[#0C1A2E] hover:underline"
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
