"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiRequestError, classesApi, schoolsApi, subjectsApi } from "@/lib/api";
import type { School, Subject } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageLoading } from "@/components/ui/page-loading";

export default function NewClassPage() {
  const { user } = useAuth();
  const router = useRouter();
  const canManage = user?.role === "TEACHER" || user?.role === "ADMIN";

  const [school, setSchool] = useState<School | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    academicYear: String(new Date().getFullYear()),
    semester: "1",
  });

  useEffect(() => {
    if (user && !canManage) {
      router.replace("/classes");
      return;
    }
    if (!user) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const [schoolResult, subjectsResult] = await Promise.allSettled([
        schoolsApi.me(),
        subjectsApi.list(),
      ]);

      if (cancelled) return;

      if (subjectsResult.status === "fulfilled") {
        const mine = subjectsResult.value;
        setSubjects(mine);
        if (mine.length === 1) setSubjectId(mine[0].id);
      } else {
        setSubjects([]);
        setError(
          subjectsResult.reason instanceof ApiRequestError
            ? subjectsResult.reason.message
            : "Could not load your subjects",
        );
      }

      if (schoolResult.status === "fulfilled") {
        setSchool(schoolResult.value);
      }

      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [user, canManage, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subjectId) {
      setFormError("Select a subject");
      return;
    }
    setFormError(null);
    setPending(true);
    try {
      const created = await classesApi.create({
        subjectId,
        name: form.name,
        description: form.description || undefined,
        academicYear: Number(form.academicYear),
        semester: Number(form.semester),
      });
      router.push(`/classes/${created.id}`);
    } catch (err) {
      setFormError(
        err instanceof ApiRequestError ? err.message : "Create failed",
      );
      setPending(false);
    }
  }

  if (loading || !user) {
    return <PageLoading label="Loading…" />;
  }

  return (
    <div className="relative mx-auto max-w-xl space-y-8">
      {pending && <PageLoading overlay label="Creating class…" />}
      <div>
        <Link
          href="/classes"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-500 transition-colors hover:text-brand-dark"
        >
          <ArrowLeft className="size-3.5" />
          Back to classes
        </Link>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-brand-dark">
          Create a class
        </h1>
        <p className="mt-1 text-[13px] text-zinc-500">
          The class will be created under your school. A join code is generated
          automatically.
        </p>
      </div>

      {error && (
        <div
          className="border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      {school && (
        <section className="border-y border-zinc-200/70 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
            School
          </p>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-[12px] text-zinc-400">Name</dt>
              <dd className="mt-0.5 text-sm font-medium text-brand-dark">
                {school.name}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] text-zinc-400">Code</dt>
              <dd className="mt-0.5 font-mono text-sm text-brand-dark">
                {school.code}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] text-zinc-400">Email</dt>
              <dd className="mt-0.5 text-sm text-zinc-600">{school.email}</dd>
            </div>
            {school.phoneNumber && (
              <div>
                <dt className="text-[12px] text-zinc-400">Phone</dt>
                <dd className="mt-0.5 text-sm text-zinc-600">
                  {school.phoneNumber}
                </dd>
              </div>
            )}
            <div className="sm:col-span-2">
              <dt className="text-[12px] text-zinc-400">Location</dt>
              <dd className="mt-0.5 text-sm text-zinc-600">
                {[school.address, school.city, school.province, school.country]
                  .filter(Boolean)
                  .join(", ")}
              </dd>
            </div>
          </dl>
        </section>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {formError && (
          <div
            className="border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
            role="alert"
          >
            {formError}
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="subjectId" className="text-[13px] text-zinc-600">
            Subject
          </Label>
          <select
            id="subjectId"
            required
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            disabled={subjects.length === 0}
            className="h-9 w-full rounded-md border border-zinc-200 bg-white px-2.5 text-sm"
          >
            <option value="">
              {subjects.length === 0
                ? "No subjects registered yet"
                : "Choose one of your subjects"}
            </option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
          {subjects.length === 0 ? (
            <p className="text-[12px] text-zinc-500">
              Register the subjects you teach first.{" "}
              <Link
                href="/subjects/new"
                className="font-medium text-brand-dark hover:underline"
              >
                Add a subject
              </Link>
            </p>
          ) : (
            <p className="text-[12px] text-zinc-400">
              Showing subjects you registered.{" "}
              <Link
                href="/subjects"
                className="font-medium text-brand-dark hover:underline"
              >
                Manage subjects
              </Link>
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-[13px] text-zinc-600">
            Class name
          </Label>
          <Input
            id="name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="h-9 rounded-md bg-transparent"
            placeholder="Form 3A Mathematics"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-[13px] text-zinc-600">
            Description
          </Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            className="rounded-md bg-transparent"
            rows={3}
            placeholder="Optional notes for students"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="year" className="text-[13px] text-zinc-600">
              Academic year
            </Label>
            <Input
              id="year"
              type="number"
              required
              min={2000}
              max={2100}
              value={form.academicYear}
              onChange={(e) =>
                setForm((f) => ({ ...f, academicYear: e.target.value }))
              }
              className="h-9 rounded-md bg-transparent"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="semester" className="text-[13px] text-zinc-600">
              Semester
            </Label>
            <Input
              id="semester"
              type="number"
              min={1}
              max={4}
              required
              value={form.semester}
              onChange={(e) =>
                setForm((f) => ({ ...f, semester: e.target.value }))
              }
              className="h-9 rounded-md bg-transparent"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            type="submit"
            disabled={pending || subjects.length === 0}
            className="h-9 rounded-md bg-brand-dark px-5 text-sm font-semibold text-white hover:bg-brand-dark/90"
          >
            {pending ? "Creating…" : "Create class"}
          </Button>
          <Link
            href="/classes"
            className="inline-flex h-9 items-center px-4 text-sm font-medium text-zinc-500 hover:text-brand-dark"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
