"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GenderSelect } from "@/components/auth/registration-fields";
import { useAuth } from "@/components/providers/auth-provider";
import { CredentialsPanel } from "@/components/users/credentials-panel";
import { OneOffPasswordField } from "@/components/users/one-off-password-field";
import { usersApi } from "@/lib/api";
import { canManageUsers } from "@/lib/roles";
import { toast, toastFromError } from "@/lib/toast";
import type { AdminUserSummary, IssuedCredentials } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { FieldError } from "@/components/ui/field-error";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageLoading } from "@/components/ui/page-loading";
import { cn } from "@/lib/utils";
import {
  fieldErrorsFromApi,
  firstFieldError,
  parseForm,
  type FieldErrors,
} from "@/lib/validation/form";
import { createParentSchema } from "@/lib/validation/schemas";

const emptyForm = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  gender: "PREFER_NOT_TO_SAY",
  password: "",
};

export default function NewParentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [pending, setPending] = useState(false);
  const [students, setStudents] = useState<AdminUserSummary[]>([]);
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [created, setCreated] = useState<{
    name: string;
    credentials: IssuedCredentials;
    userId: string;
  } | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!user) return;
    if (!canManageUsers(user.role) || user.role === "ADMIN") {
      router.replace("/users");
      return;
    }
    usersApi
      .list({ role: "STUDENT" })
      .then(setStudents)
      .catch((err) => toastFromError(err, "Could not load students"))
      .finally(() => setChecking(false));
  }, [user, router]);

  function toggleStudent(id: string) {
    setStudentIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseForm(createParentSchema, { ...form, studentIds });
    if (!parsed.ok) {
      setFieldErrors(parsed.fieldErrors);
      toast.error(firstFieldError(parsed.fieldErrors) ?? "Check the form");
      return;
    }
    setFieldErrors({});
    setPending(true);
    try {
      const data = await usersApi.createParent({
        firstName: parsed.data.firstName,
        middleName: parsed.data.middleName || undefined,
        lastName: parsed.data.lastName,
        email: parsed.data.email,
        phoneNumber: parsed.data.phoneNumber,
        gender: parsed.data.gender,
        studentIds: parsed.data.studentIds,
        ...(parsed.data.password ? { password: parsed.data.password } : {}),
      });
      setCreated({
        name: `${data.user.firstName} ${data.user.lastName}`,
        credentials: data.credentials,
        userId: data.user.id,
      });
    } catch (err) {
      setFieldErrors(fieldErrorsFromApi(err));
      toastFromError(err, "Could not create parent");
    } finally {
      setPending(false);
    }
  }

  if (!user || checking) {
    return <PageLoading label="Loading…" />;
  }

  if (created) {
    return (
      <div className="relative mx-auto max-w-xl space-y-8">
        <PageHeader
          eyebrow="Parent created"
          title={created.name}
          description="Share these credentials so they can sign in and follow their children."
        />
        <CredentialsPanel
          credentials={created.credentials}
          footer={
            <div className="flex flex-wrap gap-2">
              <ButtonLink href={`/users/${created.userId}`} size="sm">
                View profile
              </ButtonLink>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setCreated(null);
                  setForm(emptyForm);
                  setStudentIds([]);
                }}
              >
                Add another
              </Button>
              <Link
                href="/users"
                className="inline-flex h-9 items-center px-4 text-sm font-medium text-zinc-500 hover:text-brand-dark"
              >
                Back to people
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-xl space-y-8">
      {pending && <PageLoading overlay label="Creating parent…" />}
      <div>
        <Link
          href="/users"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-500 transition-colors hover:text-brand-dark"
        >
          <ArrowLeft className="size-3.5" />
          Back to people
        </Link>
        <PageHeader
          title="Add parent"
          description="Creates a parent account and links it to one or more students."
          className="mt-4 pb-0"
        />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <FieldError message={firstFieldError(fieldErrors)} />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className="text-[13px] text-zinc-600">
              First name
            </Label>
            <Input
              id="firstName"
              required
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              className="h-9 rounded-md bg-transparent"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="middleName" className="text-[13px] text-zinc-600">
              Middle name
            </Label>
            <Input
              id="middleName"
              value={form.middleName}
              onChange={(e) => setForm((f) => ({ ...f, middleName: e.target.value }))}
              className="h-9 rounded-md bg-transparent"
              placeholder="Optional"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName" className="text-[13px] text-zinc-600">
              Last name
            </Label>
            <Input
              id="lastName"
              required
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              className="h-9 rounded-md bg-transparent"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[13px] text-zinc-600">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="h-9 rounded-md bg-transparent"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-[13px] text-zinc-600">
              Phone
            </Label>
            <Input
              id="phone"
              required
              value={form.phoneNumber}
              onChange={(e) =>
                setForm((f) => ({ ...f, phoneNumber: e.target.value }))
              }
              className="h-9 rounded-md bg-transparent"
              placeholder="+263…"
            />
          </div>
        </div>

        <GenderSelect
          value={form.gender}
          onChange={(value) => setForm((f) => ({ ...f, gender: value }))}
        />
        <OneOffPasswordField
          id="password"
          value={form.password}
          onChange={(password) => setForm((f) => ({ ...f, password }))}
        />

        <div className="space-y-2 border-t border-border pt-4">
          <h2 className="text-[13px] font-semibold text-brand-dark">Children</h2>
          <p className="text-[12px] text-zinc-500">
            Select the students this parent should follow.
          </p>
          {students.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">
              Add a student first, then come back to create a parent account.
            </p>
          ) : (
            <ul className="divide-y divide-border border border-border">
              {students.map((student) => {
                const selected = student.student
                  ? studentIds.includes(student.student.id)
                  : false;
                return (
                  <li key={student.id}>
                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-3 px-3 py-2.5",
                        selected && "bg-brand-light",
                      )}
                    >
                      <input
                        type="checkbox"
                        className="size-4 rounded border-border"
                        checked={selected}
                        onChange={() => {
                          if (student.student) toggleStudent(student.student.id);
                        }}
                        disabled={!student.student}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-ink">
                          {student.firstName} {student.lastName}
                        </span>
                        <span className="block truncate font-mono text-[12px] text-muted-foreground">
                          {student.student?.studentNumber ?? student.email}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="submit" disabled={pending || students.length === 0}>
            Create parent
          </Button>
          <ButtonLink href="/users" variant="outline">
            Cancel
          </ButtonLink>
        </div>
      </form>
    </div>
  );
}
