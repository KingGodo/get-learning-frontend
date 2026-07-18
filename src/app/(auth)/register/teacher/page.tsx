"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLoading } from "@/components/auth/auth-loading";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiRequestError, authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fieldInput =
  "h-9 rounded-md border-zinc-200 bg-white px-2.5 text-sm";

export default function RegisterTeacherPage() {
  const { setSession } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gender, setGender] = useState("PREFER_NOT_TO_SAY");
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    dateOfBirth: "",
    qualification: "",
    department: "",
    bio: "",
    schoolName: "",
    schoolEmail: "",
    schoolPhone: "",
    schoolWebsite: "",
    schoolAddress: "",
    schoolCity: "",
    schoolProvince: "",
  });

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const payload: Record<string, unknown> = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        password: form.password,
        gender,
        schoolName: form.schoolName,
        schoolEmail: form.schoolEmail,
        schoolPhone: form.schoolPhone,
        schoolAddress: form.schoolAddress,
        schoolCity: form.schoolCity,
        schoolProvince: form.schoolProvince,
      };

      if (form.middleName.trim()) payload.middleName = form.middleName.trim();
      if (form.qualification.trim())
        payload.qualification = form.qualification.trim();
      if (form.department.trim()) payload.department = form.department.trim();
      if (form.bio.trim()) payload.bio = form.bio.trim();
      if (form.schoolWebsite.trim())
        payload.schoolWebsite = form.schoolWebsite.trim();
      if (form.dateOfBirth) {
        payload.dateOfBirth = new Date(form.dateOfBirth).toISOString();
      }

      const data = await authApi.registerTeacher(payload);
      setSession(data.token, {
        ...data.user,
        teacher: data.teacher,
        school: data.school,
      });
      router.replace("/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Registration failed. Please check your details and try again.",
      );
      setPending(false);
    }
  }

  return (
    <>
      {pending && <AuthLoading label="Creating your account…" />}

      <div className="relative w-full max-w-xl self-start pb-8 pt-2 sm:pt-4">
        <Link
          href="/register"
          className="text-[13px] font-medium text-zinc-500 transition-colors hover:text-[#0C1A2E]"
        >
          ← Back
        </Link>

        <h1 className="mt-4 text-xl font-semibold tracking-tight text-black">
          Create your teaching space
        </h1>
        <p className="mt-1 text-[13px] text-zinc-500">
          Set up your teacher profile and school in one step.
        </p>

        {error && (
          <div
            className="mt-5 border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-7 space-y-8">
          <section className="space-y-3.5">
            <div>
              <h2 className="text-sm font-semibold text-[#0C1A2E]">You</h2>
              <p className="mt-0.5 text-[12px] text-zinc-400">
                Required for your teacher account
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
                <Select
                  value={gender}
                  onValueChange={(v) => setGender(v ?? "PREFER_NOT_TO_SAY")}
                >
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
                label="Email"
                id="email"
                type="email"
                value={form.email}
                onChange={update}
                required
                autoComplete="email"
              />
              <Field
                label="Phone"
                id="phoneNumber"
                value={form.phoneNumber}
                onChange={update}
                required
                autoComplete="tel"
              />
              <Field
                label="Password"
                id="password"
                type="password"
                value={form.password}
                onChange={update}
                required
                autoComplete="new-password"
                hint="At least 8 characters"
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

          <section className="space-y-3.5 border-t border-zinc-200 pt-7">
            <div>
              <h2 className="text-sm font-semibold text-[#0C1A2E]">
                Teaching profile
              </h2>
              <p className="mt-0.5 text-[12px] text-zinc-400">Optional</p>
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
                  className="min-h-[72px] rounded-md border-zinc-200 bg-white text-sm"
                  placeholder="A short introduction for your profile"
                  rows={3}
                />
              </div>
            </div>
          </section>

          <section className="space-y-3.5 border-t border-zinc-200 pt-7">
            <div>
              <h2 className="text-sm font-semibold text-[#0C1A2E]">
                Your school
              </h2>
              <p className="mt-0.5 text-[12px] text-zinc-400">
                A school code is generated automatically
              </p>
            </div>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field
                label="School name"
                id="schoolName"
                value={form.schoolName}
                onChange={update}
                required
                className="sm:col-span-2"
              />
              <Field
                label="School email"
                id="schoolEmail"
                type="email"
                value={form.schoolEmail}
                onChange={update}
                required
              />
              <Field
                label="School phone"
                id="schoolPhone"
                value={form.schoolPhone}
                onChange={update}
                required
              />
              <Field
                label="Website"
                id="schoolWebsite"
                type="url"
                value={form.schoolWebsite}
                onChange={update}
                placeholder="https://… (optional)"
                className="sm:col-span-2"
              />
              <Field
                label="Address"
                id="schoolAddress"
                value={form.schoolAddress}
                onChange={update}
                required
                className="sm:col-span-2"
              />
              <Field
                label="City"
                id="schoolCity"
                value={form.schoolCity}
                onChange={update}
                required
              />
              <Field
                label="Province"
                id="schoolProvince"
                value={form.schoolProvince}
                onChange={update}
                required
              />
            </div>
          </section>

          <Button
            type="submit"
            disabled={pending}
            className="h-9 w-full rounded-md bg-[#0C1A2E] text-sm font-semibold text-white hover:bg-[#0C1A2E]/90"
          >
            Create account
          </Button>
        </form>

        <p className="mt-5 text-center text-[13px] text-zinc-500">
          Prefer student signup?{" "}
          <Link
            href="/register/student"
            className="font-medium text-[#0C1A2E] hover:underline"
          >
            Go there
          </Link>
        </p>
      </div>

      <Image
        src="/teacher.svg"
        alt=""
        width={240}
        height={190}
        className="pointer-events-none absolute bottom-4 right-4 hidden w-[min(28vw,220px)] select-none lg:block"
        priority
      />
    </>
  );
}

function Field({
  label,
  id,
  value,
  onChange,
  type = "text",
  required,
  className,
  placeholder,
  hint,
  autoComplete,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (key: string, value: string) => void;
  type?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
  hint?: string;
  autoComplete?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label htmlFor={id} className="text-[13px] text-zinc-600">
        {label}
        {!required && (
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
