"use client";

import { useMemo, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  Library,
  Users,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useDashboard } from "@/hooks/use-dashboard";
import type {
  AdminDashboard,
  Dashboard,
  SchoolAdminDashboard,
  StudentDashboard,
  TeacherDashboard,
} from "@/lib/types";
import { PageLoading } from "@/components/ui/page-loading";
import { ButtonLink } from "@/components/ui/button-link";
import { StatusBadge, statusToneFor } from "@/components/ui/status-badge";
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
  });
}

function greetingForHour(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function statusTone(status: string) {
  switch (status) {
    case "GRADED":
    case "SUBMITTED":
      return "brand" as const;
    case "LATE":
      return "danger" as const;
    default:
      return "neutral" as const;
  }
}

function initials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

function DashHero({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="border-b border-border pb-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-1.5 text-[clamp(1.5rem,2.8vw,1.85rem)] font-semibold leading-[1.15] tracking-tight text-ink">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}

function MetricStrip({
  items,
}: {
  items: Array<{ label: string; value: number; href?: string }>;
}) {
  return (
    <div
      className={cn(
        "grid gap-px overflow-hidden rounded-lg border border-border bg-border",
        items.length <= 3 ? "sm:grid-cols-3" : "grid-cols-2 lg:grid-cols-4",
      )}
    >
      {items.map((m) => {
        const content = (
          <div className="bg-card px-5 py-4 transition-colors duration-150 ease-craft">
            <p className="text-[11px] font-medium tracking-[0.04em] text-muted-foreground uppercase">
              {m.label}
            </p>
            <p className="mt-2 font-mono text-[1.5rem] leading-none font-semibold tracking-tight text-ink tabular-nums">
              {m.value.toLocaleString()}
            </p>
          </div>
        );

        if (m.href) {
          return (
            <Link
              key={m.label}
              href={m.href}
              className="block [&>div]:hover:bg-brand-light/50"
            >
              {content}
            </Link>
          );
        }

        return <div key={m.label}>{content}</div>;
      })}
    </div>
  );
}

function Section({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[13px] font-semibold tracking-tight text-ink">
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {children}
      </div>
    </section>
  );
}

function SectionLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-[12px] font-medium text-brand transition-colors hover:text-brand-hover"
    >
      {children}
      <ArrowRight className="size-3.5" />
    </Link>
  );
}

function EmptyRow({ message }: { message: string }) {
  return (
    <p className="px-5 py-12 text-center text-[13px] text-muted-foreground">
      {message}
    </p>
  );
}

function PersonRow({
  firstName,
  lastName,
  meta,
  trailing,
  href,
}: {
  firstName: string;
  lastName: string;
  meta?: string;
  trailing?: ReactNode;
  href?: string;
}) {
  const name = (
    <span className="text-[13px] font-medium text-ink">
      {firstName} {lastName}
    </span>
  );

  return (
    <li className="flex items-center gap-3 border-t border-border px-4 py-3 first:border-t-0">
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-semibold text-slate-600"
        aria-hidden
      >
        {initials(firstName, lastName)}
      </span>
      <div className="min-w-0 flex-1">
        {href ? (
          <Link href={href} className="hover:text-brand">
            {name}
          </Link>
        ) : (
          name
        )}
        {meta ? (
          <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
            {meta}
          </p>
        ) : null}
      </div>
      {trailing ? (
        <div className="shrink-0 font-mono text-[12px] text-muted-foreground tabular-nums">
          {trailing}
        </div>
      ) : null}
    </li>
  );
}

function Callout({
  label,
  children,
  action,
  tone = "brand",
}: {
  label: string;
  children: ReactNode;
  action?: ReactNode;
  tone?: "brand" | "neutral";
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 rounded-lg border px-4 py-3.5",
        tone === "brand"
          ? "border-brand/15 bg-brand-light/60"
          : "border-border bg-muted/50",
      )}
    >
      <div className="min-w-0">
        <p
          className={cn(
            "text-[11px] font-medium tracking-[0.08em] uppercase",
            tone === "brand" ? "text-brand" : "text-muted-foreground",
          )}
        >
          {label}
        </p>
        <div className="mt-1 text-[14px] leading-snug text-ink">{children}</div>
      </div>
      {action}
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof Users;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3.5 transition-colors duration-150 ease-craft hover:border-brand/25 hover:bg-brand-light/40"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-slate-600 transition-colors group-hover:bg-brand group-hover:text-white">
        <Icon className="size-4" strokeWidth={1.75} />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
          {title}
          <ArrowRight className="size-3.5 text-slate-300 transition-colors group-hover:text-brand" />
        </span>
        <span className="mt-0.5 block text-[12px] leading-relaxed text-muted-foreground">
          {description}
        </span>
      </span>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, error, loading } = useDashboard();

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

  if (loading || !data || !user) {
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
  const greet = greetingForHour();
  const metrics = [
    { label: "Schools", value: data.totalSchools, href: "/school" },
    { label: "Teachers", value: data.totalTeachers, href: "/users" },
    { label: "Students", value: data.totalStudents, href: "/users" },
    { label: "Classes", value: data.totalClasses },
  ];

  return (
    <div className="space-y-6">
      <DashHero
        eyebrow="Platform overview"
        title={`${greet}, ${name}`}
        description="Schools, people, and activity across Learning Hub."
        actions={
          <>
            <ButtonLink href="/school/new" size="sm">
              Create school
            </ButtonLink>
            <ButtonLink href="/users" variant="outline" size="sm">
              View users
            </ButtonLink>
          </>
        }
      />

      <MetricStrip items={metrics} />

      <Section
        title="Schools"
        description="Every campus on the platform"
        action={<SectionLink href="/school">View all</SectionLink>}
      >
        {data.schools.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-14 text-center">
            <Image
              src="/schools.svg"
              alt=""
              width={220}
              height={170}
              className="w-[min(60vw,200px)] select-none"
              priority
            />
            <h3 className="mt-6 text-base font-semibold text-ink">
              No schools yet
            </h3>
            <p className="mt-1.5 max-w-sm text-[13px] text-muted-foreground">
              Create the first school to start onboarding teachers and students.
            </p>
            <ButtonLink href="/school/new" size="sm" className="mt-5">
              Create school
            </ButtonLink>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[11px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
                  <th className="px-5 py-3 font-medium">School</th>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">
                    Location
                  </th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Users</th>
                  <th className="px-5 py-3 text-right font-medium">Classes</th>
                </tr>
              </thead>
              <tbody>
                {data.schools.map((school) => (
                  <tr
                    key={school.id}
                    className="border-b border-border text-[13px] last:border-b-0 transition-colors hover:bg-brand-light/40"
                  >
                    <td className="px-5 py-3.5 font-medium text-ink">
                      <Link
                        href={`/school/${school.id}`}
                        className="hover:text-brand hover:underline"
                      >
                        {school.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[12px] text-muted-foreground">
                      {school.code}
                    </td>
                    <td className="hidden px-4 py-3.5 text-muted-foreground sm:table-cell">
                      {school.city}, {school.province}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge tone={statusToneFor(school.status ?? "")}>
                        {school.status
                          ? school.status.charAt(0) +
                            school.status.slice(1).toLowerCase()
                          : "—"}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-muted-foreground">
                      {school._count.users}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-muted-foreground">
                      {school._count.classes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section
        title="Recent teachers"
        description="Newest accounts across schools"
        action={<SectionLink href="/users">All users</SectionLink>}
      >
        {data.recentTeachers.length === 0 ? (
          <EmptyRow message="No teachers yet." />
        ) : (
          <ul>
            {data.recentTeachers.map((t) => (
              <PersonRow
                key={t.id}
                firstName={t.user.firstName}
                lastName={t.user.lastName}
                meta={t.user.email}
                trailing={t.user.school?.name ?? "—"}
              />
            ))}
          </ul>
        )}
      </Section>
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
  const greet = greetingForHour();
  const metrics = [
    { label: "Teachers", value: data.totalTeachers, href: "/users" },
    { label: "Students", value: data.totalStudents, href: "/users" },
    { label: "Classes", value: data.totalClasses, href: "/classes" },
    { label: "Subjects", value: data.totalSubjects, href: "/subjects" },
  ];

  const needsSetup = data.totalSubjects === 0 || data.totalClasses === 0;

  return (
    <div className="space-y-6">
      <DashHero
        eyebrow={data.school?.name ?? "School"}
        title={`${greet}, ${name}`}
        description="Set up subjects and classes, then assign them when you add teachers."
        actions={
          <>
            <ButtonLink href="/users/new/teacher" size="sm">
              Add teacher
            </ButtonLink>
            <ButtonLink href="/users/new/student" variant="outline" size="sm">
              Add student
            </ButtonLink>
          </>
        }
      />

      {needsSetup && (
        <Callout
          label="Get started"
          action={
            <ButtonLink
              href={data.totalSubjects === 0 ? "/subjects/new" : "/classes/new"}
              size="sm"
            >
              {data.totalSubjects === 0 ? "Add subject" : "Add class"}
            </ButtonLink>
          }
        >
          {data.totalSubjects === 0
            ? "Add subjects for your school before creating classes and teachers."
            : "Create classes under your subjects so you can allocate them to teachers."}
        </Callout>
      )}

      <MetricStrip items={metrics} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickAction
          href="/subjects"
          icon={Library}
          title="Subjects"
          description="Catalog for your school"
        />
        <QuickAction
          href="/classes"
          icon={BookOpen}
          title="Classes"
          description="Sections and join codes"
        />
        <QuickAction
          href="/users"
          icon={Users}
          title="People"
          description="Teachers and students"
        />
        <QuickAction
          href="/users/new/teacher"
          icon={ClipboardList}
          title="Assign teacher"
          description="Subjects and classes"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section
          title="Recent teachers"
          action={<SectionLink href="/users">All people</SectionLink>}
        >
          {data.recentTeachers.length === 0 ? (
            <EmptyRow message="No teachers yet — add one to get started." />
          ) : (
            <ul>
              {data.recentTeachers.map((t) => (
                <PersonRow
                  key={t.id}
                  firstName={t.user.firstName}
                  lastName={t.user.lastName}
                  meta={t.user.email}
                  trailing={
                    <span className="font-mono">{t.employeeNumber}</span>
                  }
                />
              ))}
            </ul>
          )}
        </Section>

        <Section
          title="Recent students"
          action={<SectionLink href="/users">All people</SectionLink>}
        >
          {data.recentStudents.length === 0 ? (
            <EmptyRow message="No students yet." />
          ) : (
            <ul>
              {data.recentStudents.map((s) => (
                <PersonRow
                  key={s.id}
                  firstName={s.user.firstName}
                  lastName={s.user.lastName}
                  meta={s.user.email}
                  trailing={
                    <span className="font-mono">{s.studentNumber}</span>
                  }
                />
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}

function TeacherDashboardView({ data }: { data: TeacherDashboard }) {
  const greet = greetingForHour();
  const needsAllocation =
    data.totalSubjects === 0 || data.totalClasses === 0;

  const metrics = [
    { label: "Classes", value: data.totalClasses, href: "/classes" },
    { label: "Students", value: data.totalStudents, href: "/classes" },
    { label: "Assignments", value: data.totalAssignments, href: "/assignments" },
    { label: "To grade", value: data.pendingGrading, href: "/submissions" },
  ];

  const pending = useMemo(
    () =>
      data.recentSubmissions.filter(
        (s) => s.status === "SUBMITTED" || s.status === "LATE",
      ),
    [data.recentSubmissions],
  );

  return (
    <div className="space-y-6">
      <DashHero
        eyebrow={data.school?.name ?? "Teaching"}
        title={`${greet}, ${data.profile.firstName}`}
        description="Classes, deadlines, and work that needs your review."
        actions={
          <ButtonLink href="/assignments" size="sm">
            Assignments
          </ButtonLink>
        }
      />

      {needsAllocation && (
        <Callout label="Waiting on school admin">
          {data.totalSubjects === 0
            ? "No subjects have been allocated to you yet."
            : "No classes have been allocated to you yet."}{" "}
          Ask your school admin to assign subjects and classes.
        </Callout>
      )}

      {data.pendingGrading > 0 && (
        <Callout
          label="Needs grading"
          tone="neutral"
          action={
            <ButtonLink href="/submissions" size="sm">
              Grade now
            </ButtonLink>
          }
        >
          {data.pendingGrading} submission
          {data.pendingGrading === 1 ? "" : "s"} waiting for review.
        </Callout>
      )}

      <MetricStrip items={metrics} />

      {data.classes.length > 0 && (
        <Section
          title="Your classes"
          description="Who is enrolled — open a class for the full roster"
          action={<SectionLink href="/classes">All classes</SectionLink>}
        >
          <ul>
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
                  className="flex flex-col gap-2 border-t border-border px-5 py-4 first:border-t-0 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/classes/${cls.id}#students`}
                      className="text-[13px] font-semibold text-ink hover:text-brand hover:underline"
                    >
                      {cls.name}
                    </Link>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">
                      {cls.subject?.name ?? "Subject"} · {total} student
                      {total === 1 ? "" : "s"}
                    </p>
                    {total === 0 ? (
                      <p className="mt-2 text-[13px] text-muted-foreground">
                        No students yet — share code{" "}
                        <span className="font-mono text-ink">
                          {cls.classCode}
                        </span>
                      </p>
                    ) : (
                      <p className="mt-2 text-[13px] text-muted-foreground">
                        {names.join(", ")}
                        {extra > 0 ? (
                          <Link
                            href={`/classes/${cls.id}#students`}
                            className="ml-1 font-medium text-brand hover:underline"
                          >
                            +{extra} more
                          </Link>
                        ) : null}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/classes/${cls.id}#students`}
                    className="shrink-0 text-[12px] font-semibold text-brand hover:underline"
                  >
                    View roster →
                  </Link>
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Section
          title="Upcoming deadlines"
          action={<SectionLink href="/assignments">See all</SectionLink>}
        >
          {data.upcomingDeadlines.length === 0 ? (
            <EmptyRow message="Nothing due soon." />
          ) : (
            <ul>
              {data.upcomingDeadlines.map((a) => (
                <li
                  key={a.id}
                  className="flex items-start justify-between gap-3 border-t border-border px-5 py-3.5 first:border-t-0"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/assignments/${a.id}`}
                      className="text-[13px] font-medium text-ink hover:text-brand hover:underline"
                    >
                      {a.title}
                    </Link>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">
                      {a.class?.name ?? "Class"}
                    </p>
                  </div>
                  <time className="shrink-0 text-[12px] tabular-nums text-muted-foreground">
                    {formatDue(a.dueDate)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section
          title="Recent to grade"
          action={<SectionLink href="/submissions">View all</SectionLink>}
        >
          {pending.length === 0 ? (
            <EmptyRow message="No submissions waiting." />
          ) : (
            <ul>
              {pending.slice(0, 5).map((s) => (
                <li
                  key={s.id}
                  className="flex items-start justify-between gap-3 border-t border-border px-5 py-3.5 first:border-t-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-ink">
                      {s.assignment?.title ?? "Submission"}
                    </p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">
                      {s.student
                        ? `${s.student.user.firstName} ${s.student.user.lastName}`
                        : formatDue(s.submittedAt)}
                    </p>
                  </div>
                  <StatusBadge tone={statusTone(s.status)}>
                    {s.status}
                  </StatusBadge>
                </li>
              ))}
            </ul>
          )}
        </Section>
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
  const greet = greetingForHour();
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
    {
      label: "Submitted",
      value: data.recentSubmissions.length,
      href: "/submissions",
    },
  ];

  const dueSoon = data.upcomingDeadlines.length > 0;

  return (
    <div className="space-y-6">
      <DashHero
        eyebrow="Your learning"
        title={`${greet}, ${userName}`}
        description="Track what’s due, submit work, and review feedback in one place."
        actions={
          <>
            <ButtonLink href="/classes" size="sm">
              My classes
            </ButtonLink>
            <ButtonLink href="/assignments" variant="outline" size="sm">
              Assignments
            </ButtonLink>
          </>
        }
      />

      {dueSoon && (
        <Callout
          label="Up next"
          action={
            <ButtonLink
              href={`/assignments/${data.upcomingDeadlines[0].id}`}
              size="sm"
            >
              Open next
            </ButtonLink>
          }
        >
          <span className="font-semibold">
            {data.upcomingDeadlines[0].title}
          </span>
          {" · "}
          {data.upcomingDeadlines[0].class?.name ?? "Class"}
          {" · due "}
          {formatDue(data.upcomingDeadlines[0].dueDate)}
        </Callout>
      )}

      <MetricStrip items={metrics} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <QuickAction
          href="/classes"
          icon={BookOpen}
          title="Classes"
          description="Join codes and class materials"
        />
        <QuickAction
          href="/assignments"
          icon={ClipboardList}
          title="Assignments"
          description="Preview files and submit work"
        />
        <QuickAction
          href="/submissions"
          icon={ClipboardCheck}
          title="Submissions"
          description="Scores and teacher feedback"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section
          title="Still to submit"
          description="Work waiting on you"
          action={<SectionLink href="/assignments">See all</SectionLink>}
        >
          {data.upcomingDeadlines.length === 0 ? (
            <EmptyRow message="You're caught up — nothing waiting." />
          ) : (
            <ul>
              {data.upcomingDeadlines.map((a) => {
                const overdue = new Date(a.dueDate).getTime() < Date.now();
                return (
                  <li
                    key={a.id}
                    className="flex items-center gap-3 border-t border-border px-4 py-3.5 first:border-t-0 sm:px-5"
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold",
                        overdue
                          ? "bg-red-50 text-red-700"
                          : "bg-brand-light text-brand",
                      )}
                      aria-hidden
                    >
                      {formatDue(a.dueDate).split(" ")[0]?.slice(0, 3) ?? "Due"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/assignments/${a.id}`}
                        className="block truncate text-[14px] font-semibold tracking-tight text-ink hover:text-brand"
                      >
                        {a.title}
                      </Link>
                      <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                        {a.class?.name ?? "Class"}
                        {overdue ? " · Overdue" : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <time
                        className={cn(
                          "font-mono text-[12px] tabular-nums",
                          overdue
                            ? "font-medium text-red-700"
                            : "text-muted-foreground",
                        )}
                      >
                        {formatDue(a.dueDate)}
                      </time>
                      <ButtonLink
                        href={`/assignments/${a.id}`}
                        size="xs"
                        variant={overdue ? "default" : "outline"}
                      >
                        {overdue ? "Submit" : "Open"}
                      </ButtonLink>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        <Section
          title="Already submitted"
          description="Recent turn-ins and scores"
          action={<SectionLink href="/submissions">See all</SectionLink>}
        >
          {data.recentSubmissions.length === 0 ? (
            <EmptyRow message="No submissions yet." />
          ) : (
            <ul>
              {data.recentSubmissions.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center gap-3 border-t border-border px-4 py-3.5 first:border-t-0 sm:px-5"
                >
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-semibold text-slate-600"
                    aria-hidden
                  >
                    {s.score != null ? String(s.score) : "—"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={
                        s.assignment?.id
                          ? `/assignments/${s.assignment.id}`
                          : "/submissions"
                      }
                      className="block truncate text-[14px] font-semibold tracking-tight text-ink hover:text-brand"
                    >
                      {s.assignment?.title ?? "Submission"}
                    </Link>
                    <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                      Submitted {formatDue(s.submittedAt)}
                      {s.score != null ? ` · Score ${s.score}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <StatusBadge tone={statusTone(s.status)}>
                      {s.status.charAt(0) + s.status.slice(1).toLowerCase()}
                    </StatusBadge>
                    <ButtonLink
                      href={
                        s.assignment?.id
                          ? `/assignments/${s.assignment.id}`
                          : "/submissions"
                      }
                      size="xs"
                      variant="outline"
                    >
                      View
                    </ButtonLink>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}
