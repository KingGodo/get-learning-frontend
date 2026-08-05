"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, Globe, Mail, MapPin, Pencil, Phone, Plus, Search } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiRequestError, schoolsApi } from "@/lib/api";
import type { School, TermSystem } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { StatStrip } from "@/components/ui/stat-strip";
import { StatusBadge, statusToneFor } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

function termLabel(system?: TermSystem, count?: number) {
  const s = system ?? "TERM";
  const n = count ?? 3;
  const word = s === "SEMESTER" ? "Semester" : s === "QUARTER" ? "Quarter" : "Term";
  return `${n} ${word}${n !== 1 ? "s" : ""} per year`;
}

function termSystemName(system?: TermSystem) {
  if (system === "SEMESTER") return "Semesters";
  if (system === "QUARTER") return "Quarters";
  return "Terms";
}

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
      <PageHeader
        eyebrow="Administration"
        title="Schools"
        description="Every school registered on Learning Hub."
        actions={
          <ButtonLink href="/school/new" size="sm">
            <Plus className="size-3.5" />
            Create school
          </ButtonLink>
        }
      />

      {schools.length > 0 && (
        <StatStrip
          items={[
            { label: "Total", value: schools.length },
            {
              label: "Active",
              value: schools.filter((s) => s.status === "ACTIVE").length,
            },
            {
              label: "Users",
              value: schools.reduce((sum, s) => sum + (s._count?.users ?? 0), 0),
            },
            {
              label: "Classes",
              value: schools.reduce(
                (sum, s) => sum + (s._count?.classes ?? 0),
                0,
              ),
            },
          ]}
        />
      )}

      {schools.length > 0 && (
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, code, email, or city…"
            className="h-9 rounded-md border-border bg-transparent pl-9 text-sm"
          />
        </div>
      )}

      {schools.length === 0 ? (
        <EmptyState
          title="No schools yet"
          description="Create the first school to start onboarding teachers and classes."
          action={
            <ButtonLink href="/school/new" size="sm">
              <Plus className="size-3.5" />
              Create school
            </ButtonLink>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No matches"
          description="Try another search term."
        />
      ) : (
        <div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-[0.08em] text-zinc-400">
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
                    className="border-b border-border text-[13px] transition-colors hover:bg-muted/50"
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
                      <StatusBadge tone={statusToneFor(school.status ?? "")}>
                        {school.status
                          ? school.status.charAt(0) +
                            school.status.slice(1).toLowerCase()
                          : "—"}
                      </StatusBadge>
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

function ProfileField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-[13px] text-ink">{children ?? "—"}</dd>
    </div>
  );
}

function TeacherSchoolPage() {
  const { user } = useAuth();
  const canEdit = user?.role === "SCHOOL_ADMIN" || user?.role === "ADMIN";
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
        <PageHeader
          eyebrow="Administration"
          title="School"
          description="Your school profile for classes and teachers."
        />
        <EmptyState
          title="No school yet"
          description="Your account is not linked to a school yet. Contact your platform administrator to be assigned to a school."
        />
      </div>
    );
  }

  const location = [school.address, school.city, school.province, school.country]
    .filter(Boolean)
    .join(", ");

  const initials = school.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const termWord =
    school.termSystem === "SEMESTER"
      ? "semester"
      : school.termSystem === "QUARTER"
        ? "quarter"
        : "term";

  return (
    <div className="space-y-5">
      {error && (
        <div
          className="border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[12px] font-medium text-muted-foreground">School profile</p>
          <h1 className="mt-1 text-[1.75rem] font-semibold tracking-tight text-ink sm:text-[2rem]">
            {school.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
            {school.status && (
              <StatusBadge tone={statusToneFor(school.status)}>
                {school.status.charAt(0) + school.status.slice(1).toLowerCase()}
              </StatusBadge>
            )}
            <span>{school.city}, {school.province}</span>
            <span>·</span>
            <span className="font-mono text-[12px]">{school.code}</span>
          </div>
        </div>
        {canEdit && (
          <ButtonLink href="/school/edit" variant="outline" size="sm" className="shrink-0">
            <Pencil className="size-3.5" />
            Edit school
          </ButtonLink>
        )}
      </div>

      {/* ── Stat cards ── */}
      <StatStrip
        items={[
          { label: "Academic system", value: termSystemName(school.termSystem) },
          { label: `${termSystemName(school.termSystem)} / year`, value: school.termsPerYear ?? 3 },
          { label: "Country", value: school.country || "—" },
        ]}
      />

      {/* ── Contact & address ── */}
      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-[12px] font-medium text-muted-foreground">Contact</h2>
          <dl className="mt-4 space-y-5">
            <ProfileField label="Email">{school.email}</ProfileField>
            <ProfileField label="Phone">{school.phoneNumber || "—"}</ProfileField>
            <ProfileField label="Website">
              {school.website ? (
                <a href={school.website} target="_blank" rel="noreferrer" className="text-brand-dark hover:underline">
                  {school.website.replace(/^https?:\/\//, "")}
                </a>
              ) : "—"}
            </ProfileField>
          </dl>
        </section>

        <section>
          <h2 className="text-[12px] font-medium text-muted-foreground">Location</h2>
          <dl className="mt-4 space-y-5">
            <ProfileField label="Address">{school.address || "—"}</ProfileField>
            <ProfileField label="City">{school.city}</ProfileField>
            <ProfileField label="Province">{school.province}</ProfileField>
            <ProfileField label="Country">{school.country || "—"}</ProfileField>
          </dl>
        </section>
      </div>
    </div>
  );
}
