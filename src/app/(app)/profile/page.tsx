"use client";

import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { authApi } from "@/lib/api";
import { toast, toastFromError } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoading } from "@/components/ui/page-loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { themeForRole } from "@/lib/theme";

const fieldInput = "h-9 rounded-md border-border bg-white px-2.5 text-sm";

function toDateInput(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [pending, setPending] = useState(false);
  const [emailPending, setEmailPending] = useState(false);
  const [passwordPending, setPasswordPending] = useState(false);
  const [verifyPending, setVerifyPending] = useState(false);
  const [passwordVerified, setPasswordVerified] = useState(false);
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
  });
  const [emailForm, setEmailForm] = useState({
    email: "",
    currentPassword: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
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
    });
    setEmailForm({
      email: user.email,
      currentPassword: "",
    });
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordVerified(false);
  }, [user]);

  if (!user) {
    return <PageLoading label="Loading profile…" />;
  }

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
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

      await authApi.updateProfile(payload);
      await refreshUser();
      toast.success("Profile saved");
    } catch (err) {
      toastFromError(err, "Could not save profile");
    } finally {
      setPending(false);
    }
  }

  async function onChangeEmail() {
    const nextEmail = emailForm.email.trim().toLowerCase();
    if (!nextEmail) {
      toast.error("Enter a new email address.");
      return;
    }
    if (nextEmail === user!.email.trim().toLowerCase()) {
      toast.error("That is already your email address.");
      return;
    }
    if (!emailForm.currentPassword) {
      toast.error("Enter your current password to change email.");
      return;
    }

    setEmailPending(true);
    try {
      await authApi.changeEmail({
        email: nextEmail,
        currentPassword: emailForm.currentPassword,
      });
      setEmailForm((prev) => ({ ...prev, currentPassword: "" }));
      await refreshUser();
      toast.success("Email updated", "Use this address the next time you sign in.");
    } catch (err) {
      toastFromError(err, "Could not update email");
    } finally {
      setEmailPending(false);
    }
  }

  async function onChangePassword() {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Enter your current password and new password.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setPasswordPending(true);
    try {
      await authApi.changePassword(passwordForm);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordVerified(false);
      toast.success("Password updated", "Use the new password the next time you sign in.");
    } catch (err) {
      toastFromError(err, "Could not update password");
    } finally {
      setPasswordPending(false);
    }
  }

  async function onVerifyCurrentPassword() {
    if (!passwordForm.currentPassword) {
      toast.error("Enter your current password first.");
      return;
    }
    setVerifyPending(true);
    try {
      await authApi.verifyCurrentPassword(passwordForm.currentPassword);
      setPasswordVerified(true);
      toast.success("Current password verified");
    } catch (err) {
      setPasswordVerified(false);
      toastFromError(err, "Could not verify current password");
    } finally {
      setVerifyPending(false);
    }
  }

  const roleLabel = themeForRole(user.role).label;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-dark text-lg font-semibold tracking-wide text-white">
          {user.firstName[0]}
          {user.lastName[0]}
        </div>
        <PageHeader
          eyebrow="Account"
          title="Profile"
          description={`${roleLabel}${user.school?.name ? ` · ${user.school.name}` : ""}`}
          className="pb-0"
        />
      </div>

      <form onSubmit={onSubmit} className="relative space-y-8">
        {pending && <PageLoading overlay label="Saving profile…" />}

        <section className="space-y-3.5 border-y border-border py-6">
          <div>
            <h2 className="text-sm font-semibold text-brand-dark">
              Personal details
            </h2>
            <p className="mt-0.5 text-[12px] text-zinc-400">
              Name, phone, and other profile information.
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
          <section className="space-y-3.5 border-b border-border pb-6">
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
                  className="min-h-[80px] rounded-md border-border bg-white text-sm"
                  rows={3}
                />
              </div>
            </div>
          </section>
        )}

        {user.student && (
          <section className="space-y-3.5 border-b border-border pb-6">
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
          <section className="space-y-2 border-b border-border pb-6">
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

        <div className="flex flex-wrap gap-2 pt-1">
          <Button type="submit" disabled={pending} size="sm">
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>

      <section className="space-y-4 border-t border-border pt-8">
        <div>
          <h2 className="text-sm font-semibold text-brand-dark">Sign-in</h2>
          <p className="mt-0.5 text-[12px] text-zinc-400">
            Change the email and password you use to log in. Current password is required.
          </p>
        </div>

        <div className="space-y-3.5 rounded-xl border border-border bg-white p-4">
          <div>
            <h3 className="text-[13px] font-medium text-brand-dark">Email</h3>
            <p className="mt-0.5 text-[12px] text-zinc-400">
              Current: {user.email}
            </p>
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="accountEmail" className="text-[13px] text-zinc-600">
                New email
              </Label>
              <Input
                id="accountEmail"
                type="email"
                value={emailForm.email}
                autoComplete="email"
                onChange={(e) =>
                  setEmailForm((p) => ({ ...p, email: e.target.value }))
                }
                className={fieldInput}
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="emailCurrentPassword"
                className="text-[13px] text-zinc-600"
              >
                Current password
              </Label>
              <Input
                id="emailCurrentPassword"
                type="password"
                value={emailForm.currentPassword}
                autoComplete="current-password"
                onChange={(e) =>
                  setEmailForm((p) => ({ ...p, currentPassword: e.target.value }))
                }
                className={fieldInput}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => void onChangeEmail()}
              disabled={emailPending}
              size="sm"
            >
              {emailPending ? "Updating…" : "Change email"}
            </Button>
          </div>
        </div>

        <div className="space-y-3.5 rounded-xl border border-border bg-white p-4">
          <div>
            <h3 className="text-[13px] font-medium text-brand-dark">Password</h3>
            <p className="mt-0.5 text-[12px] text-zinc-400">
              Enter your current password first, then set a new one.
            </p>
          </div>
          <div className="grid gap-3.5 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="currentPassword" className="text-[13px] text-zinc-600">
                Current password
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                autoComplete="current-password"
                onChange={(e) =>
                  setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))
                }
                className={fieldInput}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] text-zinc-600">Verify</Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => void onVerifyCurrentPassword()}
                disabled={verifyPending || passwordPending}
                className="h-9 w-full justify-center"
              >
                {verifyPending ? "Verifying…" : "Verify current password"}
              </Button>
            </div>
          </div>

          {passwordVerified && (
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-[13px] text-zinc-600">
                  New password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  autoComplete="new-password"
                  onChange={(e) =>
                    setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))
                  }
                  className={fieldInput}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-[13px] text-zinc-600">
                  Confirm new password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  autoComplete="new-password"
                  onChange={(e) =>
                    setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))
                  }
                  className={fieldInput}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => void onChangePassword()}
              disabled={passwordPending || !passwordVerified}
              size="sm"
            >
              {passwordPending ? "Updating…" : "Change password"}
            </Button>
          </div>
        </div>
      </section>

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
