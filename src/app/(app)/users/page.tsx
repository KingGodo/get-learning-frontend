"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Plus, Search } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiRequestError, usersApi } from "@/lib/api";
import { themeForRole } from "@/lib/theme";
import type { AdminUserSummary, UserRole } from "@/lib/types";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { StatStrip } from "@/components/ui/stat-strip";
import { StatusBadge, statusToneFor } from "@/components/ui/status-badge";
import { APP_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

function canManageUsers(role: string | undefined) {
  return role === "ADMIN" || role === "SCHOOL_ADMIN";
}

function userInitials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

function roleLabel(role: UserRole | "ALL") {
  if (role === "ALL") return "All";
  if (role === "SCHOOL_ADMIN") return themeForRole("SCHOOL_ADMIN").label;
  if (role === "ADMIN") return themeForRole("ADMIN").label;
  return themeForRole(role).label;
}

export default function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isPlatformAdmin = user?.role === "ADMIN";
  const isSchoolAdmin = user?.role === "SCHOOL_ADMIN";

  const roleFilters: Array<"ALL" | UserRole> = isPlatformAdmin
    ? ["ALL", "ADMIN", "SCHOOL_ADMIN", "TEACHER", "STUDENT"]
    : ["ALL", "SCHOOL_ADMIN", "TEACHER", "STUDENT"];

  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | UserRole>("ALL");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (!canManageUsers(user.role)) {
      router.replace("/dashboard");
      return;
    }

    setLoading(true);
    usersApi
      .list({
        role: roleFilter === "ALL" ? undefined : roleFilter,
      })
      .then(setUsers)
      .catch((err) =>
        setError(
          err instanceof ApiRequestError
            ? err.message
            : "Failed to load users",
        ),
      )
      .finally(() => setLoading(false));
  }, [user, roleFilter, router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phoneNumber.toLowerCase().includes(q) ||
        (u.school?.name ?? "").toLowerCase().includes(q) ||
        (u.school?.code ?? "").toLowerCase().includes(q),
    );
  }, [users, query]);

  if (!user || !canManageUsers(user.role)) {
    return <PageLoading label="Loading…" />;
  }

  if (loading) {
    return <PageLoading label="Loading users…" />;
  }

  const stats = [
    { label: "Total", value: users.length },
    {
      label: "Teachers",
      value: users.filter((u) => u.role === "TEACHER").length,
    },
    {
      label: "Students",
      value: users.filter((u) => u.role === "STUDENT").length,
    },
    ...(isPlatformAdmin
      ? [
          {
            label: "School admins",
            value: users.filter((u) => u.role === "SCHOOL_ADMIN").length,
          },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-[calc(100svh-8.5rem)] flex-col gap-6">
      {error && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      <PageHeader
        eyebrow={isSchoolAdmin ? "Your school" : "Administration"}
        title="Users"
        description={
          isSchoolAdmin
            ? "Create teachers and students, then share their login credentials."
            : `Every account on ${APP_NAME}.`
        }
        actions={
          isSchoolAdmin ? (
            <>
              <ButtonLink href="/users/new/teacher" size="sm">
                <Plus className="size-3.5" />
                Add teacher
              </ButtonLink>
              <ButtonLink href="/users/new/student" variant="outline" size="sm">
                <Plus className="size-3.5" />
                Add student
              </ButtonLink>
            </>
          ) : undefined
        }
      />

      {users.length > 0 && <StatStrip items={stats} />}

      {users.length > 0 && (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:p-3.5">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, phone, or school…"
              className="h-9 rounded-md border-border bg-background pl-9 text-sm shadow-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1 rounded-md border border-border bg-background p-0.5">
            {roleFilters.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setRoleFilter(role)}
                className={cn(
                  "h-8 rounded-[5px] px-3 text-[12px] font-medium transition-colors duration-150 ease-craft",
                  roleFilter === role
                    ? "bg-brand text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-ink",
                )}
              >
                {roleLabel(role)}
              </button>
            ))}
          </div>
        </div>
      )}

      {users.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card">
          <EmptyState
            title="No users yet"
            description={
              isSchoolAdmin
                ? "Add a teacher or student to get started."
                : "Accounts will appear here once schools and users are created."
            }
            action={
              isSchoolAdmin ? (
                <ButtonLink href="/users/new/teacher" size="sm">
                  <Plus className="size-3.5" />
                  Add teacher
                </ButtonLink>
              ) : undefined
            }
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-card">
          <EmptyState
            title="No matches"
            description="Try another search or role filter."
          />
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-3">
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            {/* Mobile */}
            <ul className="divide-y divide-border sm:hidden">
              {filtered.map((u) => (
                <li key={u.id} className="px-4 py-4">
                  <Link href={`/users/${u.id}`} className="flex items-start gap-3">
                    <span
                      className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-light text-[12px] font-semibold text-brand"
                      aria-hidden
                    >
                      {userInitials(u.firstName, u.lastName)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[15px] font-semibold tracking-tight text-ink">
                          {u.firstName} {u.lastName}
                        </span>
                        <ChevronRight className="size-3.5 shrink-0 text-slate-300" />
                      </span>
                      <span className="mt-1 block truncate text-[12px] text-muted-foreground">
                        {u.email}
                      </span>
                      <span className="mt-2 flex flex-wrap items-center gap-2">
                        <StatusBadge tone="brand">
                          {roleLabel(u.role)}
                        </StatusBadge>
                        <StatusBadge tone={statusToneFor(u.status)}>
                          {u.status.charAt(0) + u.status.slice(1).toLowerCase()}
                        </StatusBadge>
                      </span>
                    </span>
                  </Link>
                  <div className="mt-3 pl-[3.25rem]">
                    <ButtonLink
                      href={`/users/${u.id}`}
                      size="sm"
                      variant="outline"
                      className="w-full"
                    >
                      Open
                    </ButtonLink>
                  </div>
                </li>
              ))}
            </ul>

            {/* Desktop */}
            <div className="hidden overflow-x-auto sm:block">
              <table
                className={cn(
                  "w-full table-fixed border-collapse text-left",
                  isPlatformAdmin ? "min-w-[860px]" : "min-w-[760px]",
                )}
              >
                <colgroup>
                  {isPlatformAdmin ? (
                    <>
                      <col className="w-[22%]" />
                      <col className="w-[22%]" />
                      <col className="w-[14%]" />
                      <col className="w-[16%]" />
                      <col className="w-[10%]" />
                      <col className="w-[8%]" />
                      <col className="w-[8%]" />
                    </>
                  ) : (
                    <>
                      <col className="w-[26%]" />
                      <col className="w-[26%]" />
                      <col className="w-[16%]" />
                      <col className="w-[12%]" />
                      <col className="w-[10%]" />
                      <col className="w-[10%]" />
                    </>
                  )}
                </colgroup>
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[11px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
                    <th className="px-5 py-2.5 font-medium">Name</th>
                    <th className="px-5 py-2.5 font-medium">Email</th>
                    <th className="px-5 py-2.5 font-medium">Role</th>
                    {isPlatformAdmin && (
                      <th className="px-5 py-2.5 font-medium">School</th>
                    )}
                    <th className="px-5 py-2.5 font-medium">Status</th>
                    <th className="px-5 py-2.5 text-right font-medium">Joined</th>
                    <th className="px-5 py-2.5 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-border last:border-b-0 transition-colors duration-150 ease-craft hover:bg-muted/40"
                    >
                      <td className="px-5 py-3.5 align-middle">
                        <Link
                          href={`/users/${u.id}`}
                          className="flex min-w-0 items-center gap-3"
                        >
                          <span
                            className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand-light text-[11px] font-semibold text-brand"
                            aria-hidden
                          >
                            {userInitials(u.firstName, u.lastName)}
                          </span>
                          <span className="truncate text-[14px] font-semibold tracking-tight text-ink hover:text-brand">
                            {u.firstName} {u.lastName}
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 align-middle">
                        <span className="block truncate text-[13px] text-slate-600">
                          {u.email}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 align-middle">
                        <StatusBadge tone="brand">
                          {roleLabel(u.role)}
                        </StatusBadge>
                      </td>
                      {isPlatformAdmin && (
                        <td className="px-5 py-3.5 align-middle">
                          {u.school ? (
                            <Link
                              href={`/school/${u.school.id}`}
                              className="block truncate text-[13px] font-medium text-ink hover:text-brand hover:underline"
                            >
                              {u.school.name}
                            </Link>
                          ) : (
                            <span className="text-[13px] text-muted-foreground">
                              —
                            </span>
                          )}
                        </td>
                      )}
                      <td className="px-5 py-3.5 align-middle">
                        <StatusBadge tone={statusToneFor(u.status)}>
                          {u.status.charAt(0) + u.status.slice(1).toLowerCase()}
                        </StatusBadge>
                      </td>
                      <td className="px-5 py-3.5 text-right align-middle font-mono text-[12px] text-muted-foreground tabular-nums">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-right align-middle">
                        <ButtonLink
                          href={`/users/${u.id}`}
                          size="sm"
                          variant="outline"
                        >
                          Open
                        </ButtonLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-[12px] text-muted-foreground">
            Showing {filtered.length} of {users.length} user
            {users.length === 1 ? "" : "s"}
          </p>
        </div>
      )}
    </div>
  );
}
