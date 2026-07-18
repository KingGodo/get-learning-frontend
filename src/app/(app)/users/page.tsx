"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiRequestError, usersApi } from "@/lib/api";
import type { AdminUserSummary, UserRole } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { PageLoading } from "@/components/ui/page-loading";
import { cn } from "@/lib/utils";

const ROLE_FILTERS: Array<"ALL" | UserRole> = [
  "ALL",
  "ADMIN",
  "TEACHER",
  "STUDENT",
];

export default function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | UserRole>("ALL");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "ADMIN") {
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

  if (!user || user.role !== "ADMIN") {
    return <PageLoading label="Loading…" />;
  }

  if (loading) {
    return <PageLoading label="Loading users…" />;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div
          className="border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
          Administration
        </p>
        <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-[#0C1A2E]">
          Users
        </h1>
        <p className="mt-1 text-[13px] text-zinc-500">
          Every account on the Lumen platform — admins, teachers, and students.
        </p>
      </div>

      {users.length > 0 && (
        <div className="flex flex-wrap gap-x-10 gap-y-4 border-y border-zinc-200/70 py-5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">
              Total
            </p>
            <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-[#0C1A2E]">
              {users.length}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">
              Teachers
            </p>
            <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-[#0C1A2E]">
              {users.filter((u) => u.role === "TEACHER").length}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">
              Students
            </p>
            <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-[#0C1A2E]">
              {users.filter((u) => u.role === "STUDENT").length}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">
              Admins
            </p>
            <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-[#0C1A2E]">
              {users.filter((u) => u.role === "ADMIN").length}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-zinc-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, phone, or school…"
            className="h-9 rounded-md border-zinc-200 bg-transparent pl-9 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ROLE_FILTERS.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setRoleFilter(role)}
              className={cn(
                "h-8 px-3 text-[12px] font-semibold uppercase tracking-wide transition-colors",
                roleFilter === role
                  ? "bg-[#0C1A2E] text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80",
              )}
            >
              {role === "ALL" ? "All" : role.charAt(0) + role.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {users.length === 0 ? (
        <div className="px-2 py-14 text-center">
          <p className="text-sm font-medium text-[#0C1A2E]">No users yet</p>
          <p className="mt-1 text-[13px] text-zinc-500">
            Accounts will appear here once people register.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-2 py-14 text-center">
          <p className="text-sm font-medium text-[#0C1A2E]">No matches</p>
          <p className="mt-1 text-[13px] text-zinc-500">
            Try another search or role filter.
          </p>
        </div>
      ) : (
        <div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left">
              <thead>
                <tr className="border-b border-zinc-200/70 text-[11px] uppercase tracking-[0.08em] text-zinc-400">
                  <th className="py-3 pr-4 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">
                    School
                  </th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="py-3 pl-4 text-right font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
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
                    <td className="hidden px-4 py-3.5 text-zinc-500 sm:table-cell">
                      {u.school ? (
                        <Link
                          href={`/school/${u.school.id}`}
                          className="hover:text-[#0C1A2E] hover:underline"
                        >
                          {u.school.name}
                        </Link>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
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
                    <td className="py-3.5 pl-4 text-right tabular-nums text-zinc-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pt-3 text-[12px] text-zinc-400">
            Showing {filtered.length} of {users.length} user
            {users.length === 1 ? "" : "s"}
          </div>
        </div>
      )}
    </div>
  );
}
