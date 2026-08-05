"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GenderSelect } from "@/components/auth/registration-fields";
import { useAuth } from "@/components/providers/auth-provider";
import {
  TeacherAssignmentsFields,
  assignmentsAreValid,
  type TeacherAssignmentDraft,
} from "@/components/users/teacher-assignments-fields";
import { ApiRequestError, classesApi, subjectsApi, usersApi } from "@/lib/api";
import { toastFromError } from "@/lib/toast";
import type { AdminUserDetail, ClassRoom, Subject } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoading } from "@/components/ui/page-loading";

function hydrateAssignments(user: AdminUserDetail): TeacherAssignmentDraft[] {
  const bySubject = new Map<string, string[]>();

  for (const row of user.teacher?.teacherSubjects ?? []) {
    bySubject.set(row.subject.id, []);
  }

  for (const ct of user.teacher?.classTeachers ?? []) {
    const subjectId = ct.class.subjectId ?? ct.class.subject?.id;
    if (!subjectId) continue;
    const existing = bySubject.get(subjectId) ?? [];
    existing.push(ct.class.id);
    bySubject.set(subjectId, existing);
  }

  return Array.from(bySubject.entries()).map(([subjectId, classIds]) => ({
    subjectId,
    classIds,
  }));
}

export default function EditUserPage() {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignmentDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authUser) return;
    if (authUser.role !== "ADMIN" && authUser.role !== "SCHOOL_ADMIN") {
      router.replace("/dashboard");
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const data = await usersApi.get(id);
        if (cancelled) return;
        setUser(data);
        setForm({
          firstName: data.firstName ?? "",
          middleName: data.middleName ?? "",
          lastName: data.lastName ?? "",
          email: data.email ?? "",
          phoneNumber: data.phoneNumber ?? "",
          gender: data.gender ?? "PREFER_NOT_TO_SAY",
          department: data.teacher?.department ?? "",
          qualification: data.teacher?.qualification ?? "",
          guardianName: data.student?.guardianName ?? "",
          guardianPhone: data.student?.guardianPhone ?? "",
          guardianEmail: data.student?.guardianEmail ?? "",
          emergencyContact: data.student?.emergencyContact ?? "",
        });

        if (data.teacher && authUser.role === "SCHOOL_ADMIN") {
          const [subjectRows, classRows] = await Promise.all([
            subjectsApi.list(),
            classesApi.list(),
          ]);
          if (cancelled) return;
          setSubjects(subjectRows);
          setClasses(classRows);
          setAssignments(hydrateAssignments(data));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiRequestError
              ? err.message
              : "Failed to load user details",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [authUser, id, router]);

  if (!authUser || loading) {
    return <PageLoading label="Loading user…" />;
  }

  if (error || !user) {
    return (
      <div className="space-y-4">
        <Link
          href={`/users/${id}`}
          className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-brand-dark"
        >
          <ArrowLeft className="size-3.5" />
          Back to user
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

  const canEdit =
    authUser.role === "ADMIN" ||
    (authUser.role === "SCHOOL_ADMIN" && user.role !== "SCHOOL_ADMIN");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit || !user) return;

    if (user.teacher && authUser.role === "SCHOOL_ADMIN") {
      if (!assignmentsAreValid(assignments)) {
        toast.error(
          "Select at least one subject and at least one class for each selected subject.",
        );
        return;
      }
    }

    setPending(true);
    try {
      await usersApi.update(id, {
        firstName: form.firstName,
        middleName: form.middleName || null,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        gender: form.gender,
        ...(user.teacher
          ? {
              department: form.department || null,
              qualification: form.qualification || null,
              ...(authUser.role === "SCHOOL_ADMIN"
                ? { assignments }
                : {}),
            }
          : {}),
        ...(user.student
          ? {
              guardianName: form.guardianName,
              guardianPhone: form.guardianPhone,
              guardianEmail: form.guardianEmail || null,
              emergencyContact: form.emergencyContact || null,
            }
          : {}),
      });
      router.replace(`/users/${id}`);
    } catch (err) {
      toastFromError(err, "Could not update user");
      setPending(false);
    }
  }

  return (
    <div className="relative mx-auto max-w-xl space-y-8">
      {pending && <PageLoading overlay label="Saving changes…" />}
      <div>
        <Link
          href={`/users/${id}`}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-500 transition-colors hover:text-brand-dark"
        >
          <ArrowLeft className="size-3.5" />
          Back to user
        </Link>
        <PageHeader
          title="Edit user"
          description="Update personal details for this account."
          className="mt-4 pb-0"
        />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            id="firstName"
            label="First name"
            value={form.firstName ?? ""}
            onChange={(v) => setForm((f) => ({ ...f, firstName: v }))}
            required
          />
          <Field
            id="middleName"
            label="Middle name"
            value={form.middleName ?? ""}
            onChange={(v) => setForm((f) => ({ ...f, middleName: v }))}
          />
          <Field
            id="lastName"
            label="Last name"
            value={form.lastName ?? ""}
            onChange={(v) => setForm((f) => ({ ...f, lastName: v }))}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="email"
            label="Email"
            type="email"
            value={form.email ?? ""}
            onChange={(v) => setForm((f) => ({ ...f, email: v }))}
            required
          />
          <Field
            id="phoneNumber"
            label="Phone"
            value={form.phoneNumber ?? ""}
            onChange={(v) => setForm((f) => ({ ...f, phoneNumber: v }))}
            required
          />
        </div>

        <GenderSelect
          id="gender"
          value={form.gender ?? "PREFER_NOT_TO_SAY"}
          onChange={(v) => setForm((f) => ({ ...f, gender: v }))}
        />

        {user.teacher && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="department"
              label="Department"
              value={form.department ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, department: v }))}
            />
            <Field
              id="qualification"
              label="Qualification"
              value={form.qualification ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, qualification: v }))}
            />
          </div>
        )}

        {user.teacher && authUser.role === "SCHOOL_ADMIN" && (
          <TeacherAssignmentsFields
            subjects={subjects}
            classes={classes}
            value={assignments}
            onChange={setAssignments}
            disabled={pending || !canEdit}
          />
        )}

        {user.student && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="guardianName"
                label="Guardian name"
                value={form.guardianName ?? ""}
                onChange={(v) => setForm((f) => ({ ...f, guardianName: v }))}
                required
              />
              <Field
                id="guardianPhone"
                label="Guardian phone"
                value={form.guardianPhone ?? ""}
                onChange={(v) => setForm((f) => ({ ...f, guardianPhone: v }))}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="guardianEmail"
                label="Guardian email"
                type="email"
                value={form.guardianEmail ?? ""}
                onChange={(v) => setForm((f) => ({ ...f, guardianEmail: v }))}
              />
              <Field
                id="emergencyContact"
                label="Emergency contact"
                value={form.emergencyContact ?? ""}
                onChange={(v) => setForm((f) => ({ ...f, emergencyContact: v }))}
              />
            </div>
          </>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            type="submit"
            disabled={
              pending ||
              !canEdit ||
              (Boolean(user.teacher) &&
                authUser.role === "SCHOOL_ADMIN" &&
                !assignmentsAreValid(assignments))
            }
            className="h-9 rounded-md bg-brand-dark px-5 text-sm font-medium text-white transition-colors hover:bg-brand-dark-hover"
          >
            {pending ? "Saving…" : "Save changes"}
          </Button>
          <Link
            href={`/users/${id}`}
            className="inline-flex h-9 items-center px-4 text-sm font-medium text-zinc-500 hover:text-brand-dark"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[13px] text-zinc-600">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-md bg-transparent"
      />
    </div>
  );
}
