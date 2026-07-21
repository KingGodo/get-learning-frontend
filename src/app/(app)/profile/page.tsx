"use client";

import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiRequestError, authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageLoading } from "@/components/ui/page-loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fieldInput = "h-9 rounded-md border-zinc-200 bg-white px-2.5 text-sm";

function toDateInput(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [gender, setGender] = useState("PREFER_NOT_TO_SAY");
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    phoneNumber: "",
    dateOfBirth: "",
    department: "",
    qualification: "",
    bio: "",
    guardianName: "",
    guardianPhone: "",
    guardianEmail: "",
    emergencyContact: "",
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    if (!user) return;
    setGender(user.gender ?? "PREFER_NOT_TO_SAY");
    setForm({
      firstName: user.firstName,
      middleName: user.middleName ?? "",
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      dateOfBirth: toDateInput(user.dateOfBirth),
      department: user.teacher?.department ?? "",
      qualification: user.teacher?.qualification ?? "",
      bio: user.teacher?.bio ?? "",
      guardianName: user.student?.guardianName ?? "",
      guardianPhone: user.student?.guardianPhone ?? "",
      guardianEmail: user.student?.guardianEmail ?? "",
      emergencyContact: user.student?.emergencyContact ?? "",
      currentPassword: "",
      newPassword: "",
    });
  }, [user]);

  if (!user) {
    return <PageLoading label="Loading profile…" />;
  }

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setPending(true);
    try {
      const payload: Record<string, unknown> = {
        firstName: form.firstName,
        middleName: form.middleName || null,
        lastName: form.lastName,
        phoneNumber: form.phoneNumber,
        gender,
        dateOfBirth: form.dateOfBirth
          ? new Date(form.dateOfBirth).toISOString()
          : null,
      };

      if (user!.role === "TEACHER" || user!.teacher) {
        payload.department = form.department || null;
        payload.qualification = form.qualification || null;
        payload.bio = form.bio || null;
      }

      if (user!.role === "STUDENT" || user!.student) {
        payload.guardianName = form.guardianName;
        payload.guardianPhone = form.guardianPhone;
        payload.guardianEmail = form.guardianEmail || null;
        payload.emergencyContact = form.emergencyContact || null;
      }

      if (form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }

      await authApi.updateProfile(payload);
      await refreshUser();
      setForm((f) => ({ ...f, currentPassword: "", newPassword: "" }));
      setSuccess("Profile saved.");
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Could not save profile",
      );
    } finally {
      setPending(false);
    }
  }

  const roleLabel =
    user.role === "STUDENT"
      ? "Student"
      : user.role === "ADMIN"
        ? "Administrator"
        : "Teacher";

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-dark text-lg font-semibold tracking-wide text-white">
          {user.firstName[0]}
          {user.lastName[0]}
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
            Account
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-brand-dark">
            Profile
          </h1>
          <p className="mt-1 text-[13px] text-zinc-500">
            {roleLabel}
            {user.school?.name ? ` · ${user.school.name}` : ""}
          </p>
        </div>
      </div>

      {(error || success) && (
        <div
          className={
            error
              ? "border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
              : "border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-[13px] text-emerald-800"
          }
          role="status"
        >
          {error ?? success}
        </div>
      )}

      <form onSubmit={onSubmit} className="relative space-y-8">
        {pending && <PageLoading overlay label="Saving profile…" />}

        <section className="space-y-3.5 border-y border-zinc-200/70 py-6">
          <div>
            <h2 className="text-sm font-semibold text-brand-dark">
              Personal details
            </h2>
            <p className="mt-0.5 text-[12px] text-zinc-400">
              Email stays the same — contact support to change it.
            </p>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field
              label="First name"
              id="firstName"
              value={form.firstName}
              onChange={update}
              required
            />
            <Field
              label="Last name"
              id="lastName"
              value={form.lastName}
              onChange={update}
              required
            />
            <Field
              label="Middle name"
              id="middleName"
              value={form.middleName}
              onChange={update}
            />
            <div className="space-y-1.5">
              <Label className="text-[13px] text-zinc-600">Gender</Label>
              <Select value={gender} onValueChange={(v) => setGender(v ?? gender)}>
                <SelectTrigger className={`w-full ${fieldInput}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                  <SelectItem value="PREFER_NOT_TO_SAY">
                    Prefer not to say
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[13px] text-zinc-600">
                Email
              </Label>
              <Input
                id="email"
                value={user.email}
                disabled
                className={`${fieldInput} bg-zinc-50 text-zinc-500`}
              />
            </div>
            <Field
              label="Phone"
              id="phoneNumber"
              value={form.phoneNumber}
              onChange={update}
              required
            />
            <Field
              label="Date of birth"
              id="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={update}
            />
          </div>
        </section>

        {user.teacher && (
          <section className="space-y-3.5 border-b border-zinc-200/70 pb-6">
            <div>
              <h2 className="text-sm font-semibold text-brand-dark">
                Teaching profile
              </h2>
              <p className="mt-0.5 text-[12px] text-zinc-400">
                Employee no. {user.teacher.employeeNumber}
              </p>
            </div>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field
                label="Department"
                id="department"
                value={form.department}
                onChange={update}
                placeholder="Mathematics"
              />
              <Field
                label="Qualification"
                id="qualification"
                value={form.qualification}
                onChange={update}
                placeholder="B.Ed, MSc…"
              />
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="bio" className="text-[13px] text-zinc-600">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={form.bio}
                  onChange={(e) => update("bio", e.target.value)}
                  className="min-h-[80px] rounded-md border-zinc-200 bg-white text-sm"
                  rows={3}
                />
              </div>
            </div>
          </section>
        )}

        {user.student && (
          <section className="space-y-3.5 border-b border-zinc-200/70 pb-6">
            <div>
              <h2 className="text-sm font-semibold text-brand-dark">Guardian</h2>
              <p className="mt-0.5 text-[12px] text-zinc-400">
                Student no. {user.student.studentNumber}
              </p>
            </div>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field
                label="Guardian name"
                id="guardianName"
                value={form.guardianName}
                onChange={update}
                required
              />
              <Field
                label="Guardian phone"
                id="guardianPhone"
                value={form.guardianPhone}
                onChange={update}
                required
              />
              <Field
                label="Guardian email"
                id="guardianEmail"
                type="email"
                value={form.guardianEmail}
                onChange={update}
              />
              <Field
                label="Emergency contact"
                id="emergencyContact"
                value={form.emergencyContact}
                onChange={update}
              />
            </div>
          </section>
        )}

        {user.school && (
          <section className="space-y-2 border-b border-zinc-200/70 pb-6">
            <h2 className="text-sm font-semibold text-brand-dark">School</h2>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-[12px] text-zinc-400">Name</dt>
                <dd className="mt-0.5 text-sm font-medium text-brand-dark">
                  {user.school.name}
                </dd>
              </div>
              <div>
                <dt className="text-[12px] text-zinc-400">Code</dt>
                <dd className="mt-0.5 font-mono text-sm text-brand-dark">
                  {user.school.code}
                </dd>
              </div>
            </dl>
          </section>
        )}

        <section className="space-y-3.5">
          <div>
            <h2 className="text-sm font-semibold text-brand-dark">Password</h2>
            <p className="mt-0.5 text-[12px] text-zinc-400">
              Leave blank to keep your current password.
            </p>
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field
              label="Current password"
              id="currentPassword"
              type="password"
              value={form.currentPassword}
              onChange={update}
              autoComplete="current-password"
            />
            <Field
              label="New password"
              id="newPassword"
              type="password"
              value={form.newPassword}
              onChange={update}
              autoComplete="new-password"
              hint="At least 8 characters"
            />
          </div>
        </section>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            type="submit"
            disabled={pending}
            className="h-9 rounded-md bg-brand-dark px-5 text-sm font-semibold text-white hover:bg-brand-dark/90"
          >
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>

      <p className="flex items-center gap-2 text-[12px] text-zinc-400">
        <UserRound className="size-3.5" />
        Signed in as {user.email}
      </p>
    </div>
  );
}

function Field({
  label,
  id,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  hint,
  autoComplete,
}: {
  label: string;
  id: keyof {
    firstName: string;
    middleName: string;
    lastName: string;
    phoneNumber: string;
    dateOfBirth: string;
    department: string;
    qualification: string;
    bio: string;
    guardianName: string;
    guardianPhone: string;
    guardianEmail: string;
    emergencyContact: string;
    currentPassword: string;
    newPassword: string;
  };
  value: string;
  onChange: (key: typeof id, value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[13px] text-zinc-600">
        {label}
        {!required && type !== "password" && (
          <span className="ml-1 font-normal text-zinc-400">(optional)</span>
        )}
      </Label>
      <Input
        id={id}
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(id, e.target.value)}
        className={fieldInput}
      />
      {hint && <p className="text-[11px] text-zinc-400">{hint}</p>}
    </div>
  );
}
