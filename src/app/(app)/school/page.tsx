"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus, Search } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiRequestError, schoolsApi } from "@/lib/api";
import type { School } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { PageLoading } from "@/components/ui/page-loading";
import { cn } from "@/lib/utils";

type AdminSchool = School & {
  _count: { users: number; classes: number };
  createdAt?: string;
};

export default function SchoolPage() {
  const { user } = useAuth();

  if (!user) {
    return <PageLoading label="Loading…" />;
  }

  if (user.role === "ADMIN") {
    return <AdminSchoolsPage />;
  }

  return <TeacherSchoolPage />;
}

function AdminSchoolsPage() {
  const [schools, setSchools] = useState<AdminSchool[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    schoolsApi
      .list()
      .then((data) => setSchools(data as AdminSchool[]))
      .catch((err) =>
        setError(
          err instanceof ApiRequestError
            ? err.message
            : "Failed to load schools",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return schools;
    return schools.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.province.toLowerCase().includes(q),
    );
  }, [schools, query]);

  if (loading) {
    return <PageLoading label="Loading schools…" />;
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
            Administration
          </p>
          <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-brand-dark">
            Schools
          </h1>
          <p className="mt-1 text-[13px] text-zinc-500">
            Every school registered on Learning Hub.
          </p>
        </div>
        <Link
          href="/school/new"
          className="inline-flex h-9 items-center gap-1.5 bg-brand-dark px-3.5 text-sm font-semibold text-white hover:bg-brand-dark/90"
        >
          <Plus className="size-3.5" />
          Create school
        </Link>
      </div>

      {schools.length > 0 && (
        <div className="flex flex-wrap gap-x-10 gap-y-4 border-y border-zinc-200/70 py-5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">
              Total
            </p>
            <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-brand-dark">
              {schools.length}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">
              Active
            </p>
            <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-brand-dark">
              {schools.filter((s) => s.status === "ACTIVE").length}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">
              Users
            </p>
            <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-brand-dark">
              {schools.reduce((sum, s) => sum + (s._count?.users ?? 0), 0)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">
              Classes
            </p>
            <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-brand-dark">
              {schools.reduce((sum, s) => sum + (s._count?.classes ?? 0), 0)}
            </p>
          </div>
        </div>
      )}

      {schools.length > 0 && (
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-zinc-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, code, email, or city…"
            className="h-9 rounded-md border-zinc-200 bg-transparent pl-9 text-sm"
          />
        </div>
      )}

      {schools.length === 0 ? (
        <div className="flex flex-col items-center px-2 py-10 text-center sm:py-14">
          <Image
            src="/schools.svg"
            alt=""
            width={280}
            height={220}
            className="w-[min(70vw,240px)] select-none"
            priority
          />
          <h2 className="mt-6 text-base font-semibold text-brand-dark">
            No schools yet
          </h2>
          <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-zinc-500">
            Create the first school to start onboarding teachers and classes.
          </p>
          <Link
            href="/school/new"
            className="mt-5 inline-flex h-9 items-center gap-1.5 bg-brand-dark px-3.5 text-sm font-semibold text-white hover:bg-brand-dark/90"
          >
            <Plus className="size-3.5" />
            Create school
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-2 py-14 text-center">
          <p className="text-sm font-medium text-brand-dark">No matches</p>
          <p className="mt-1 text-[13px] text-zinc-500">
            Try another search term.
          </p>
        </div>
      ) : (
        <div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-zinc-200/70 text-[11px] uppercase tracking-[0.08em] text-zinc-400">
                  <th className="py-3 pr-4 font-medium">School</th>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">
                    Location
                  </th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Users</th>
                  <th className="py-3 pl-4 text-right font-medium">Classes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((school) => (
                  <tr
                    key={school.id}
                    className="border-b border-zinc-200/50 text-[13px] transition-colors hover:bg-zinc-200/30"
                  >
                    <td className="py-3.5 pr-4 font-medium text-brand-dark">
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
                    <td className="px-4 py-3.5 text-zinc-600">{school.email}</td>
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
                      {school._count?.users ?? 0}
                    </td>
                    <td className="py-3.5 pl-4 text-right tabular-nums text-zinc-600">
                      {school._count?.classes ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pt-3 text-[12px] text-zinc-400">
            Showing {filtered.length} of {schools.length} school
            {schools.length === 1 ? "" : "s"}
          </div>
        </div>
      )}
    </div>
  );
}

function TeacherSchoolPage() {
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    schoolsApi
      .me()
      .then(setSchool)
      .catch((err) => {
        if (err instanceof ApiRequestError && err.status === 404) {
          setMissing(true);
          return;
        }
        setError(
          err instanceof ApiRequestError
            ? err.message
            : "Failed to load school",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <PageLoading label="Loading school…" />;
  }

  if (missing || !school) {
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
          <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-brand-dark">
            School
          </h1>
          <p className="mt-1 text-[13px] text-zinc-500">
            Your school profile for classes and teachers.
          </p>
        </div>

        <div className="flex flex-col items-center px-2 py-10 text-center sm:py-14">
          <Image
            src="/schools.svg"
            alt=""
            width={280}
            height={220}
            className="w-[min(70vw,240px)] select-none"
            priority
          />
          <h2 className="mt-6 text-base font-semibold text-brand-dark">
            No school yet
          </h2>
          <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-zinc-500">
            Your account is not linked to a school yet. Contact your platform
            administrator to be assigned to a school.
          </p>
        </div>
      </div>
    );
  }

  const location = [school.address, school.city, school.province, school.country]
    .filter(Boolean)
    .join(", ");

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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
            Administration
          </p>
          <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-brand-dark">
            {school.name}
          </h1>
          <p className="mt-1 text-[13px] text-zinc-500">
            School code{" "}
            <span className="font-mono font-medium text-zinc-700">
              {school.code}
            </span>
          </p>
        </div>
        <Link
          href="/school/edit"
          className="inline-flex h-9 items-center gap-1.5 border border-zinc-200 bg-transparent px-3.5 text-sm font-semibold text-brand-dark hover:bg-zinc-200/40"
        >
          <Pencil className="size-3.5" />
          Edit school
        </Link>
      </div>

      <section className="border-y border-zinc-200/70 py-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
          Overview
        </p>
        <dl className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-[12px] text-zinc-400">Email</dt>
            <dd className="mt-1 text-sm font-medium text-brand-dark">
              {school.email}
            </dd>
          </div>
          <div>
            <dt className="text-[12px] text-zinc-400">Phone</dt>
            <dd className="mt-1 text-sm font-medium text-brand-dark">
              {school.phoneNumber || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[12px] text-zinc-400">Website</dt>
            <dd className="mt-1 text-sm font-medium text-brand-dark">
              {school.website ? (
                <a
                  href={school.website}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  {school.website.replace(/^https?:\/\//, "")}
                </a>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-[12px] text-zinc-400">Address</dt>
            <dd className="mt-1 text-sm font-medium text-brand-dark">
              {location || "—"}
            </dd>
          </div>
          {school.status && (
            <div>
              <dt className="text-[12px] text-zinc-400">Status</dt>
              <dd className="mt-1">
                <span
                  className={
                    school.status === "ACTIVE"
                      ? "inline-flex bg-emerald-50/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700"
                      : "inline-flex bg-zinc-200/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500"
                  }
                >
                  {school.status}
                </span>
              </dd>
            </div>
          )}
        </dl>
      </section>
    </div>
  );
}
