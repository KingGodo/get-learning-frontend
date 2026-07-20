"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLoading } from "@/components/auth/auth-loading";
import {
  Field,
  GenderSelect,
  PasswordMatchHint,
  selectInput,
} from "@/components/auth/registration-fields";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiRequestError, authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type RegistrationSchool = {
  id: string;
  name: string;
  code: string;
  city: string;
  province: string;
};

export default function RegisterTeacherPage() {
  const { setSession } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schools, setSchools] = useState<RegistrationSchool[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [schoolsError, setSchoolsError] = useState<string | null>(null);
  const [gender, setGender] = useState("PREFER_NOT_TO_SAY");
  const [schoolId, setSchoolId] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const loadSchools = useCallback(async () => {
    setSchoolsLoading(true);
    setSchoolsError(null);
    try {
      const data = await authApi.listRegistrationSchools();
      setSchools(data);
      if (data.length === 1) setSchoolId(data[0].id);
    } catch (err) {
      setSchools([]);
      setSchoolsError(
        err instanceof ApiRequestError
          ? err.message
          : "Could not load schools. Check your connection and try again.",
      );
    } finally {
      setSchoolsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSchools();
  }, [loadSchools]);

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!schoolId) {
      setError("Please select your school.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match. Please check and try again.");
      return;
    }

    setPending(true);
    try {
      const data = await authApi.registerTeacher({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        password: form.password,
        gender,
        schoolId,
      });
      setSession(data.token, {
        ...data.user,
        teacher: data.teacher,
        school: data.school,
      });
      router.replace("/subjects");
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
          Join as a teacher
        </h1>
        <p className="mt-1 text-[13px] text-zinc-500">
          Create your account and choose the school you teach at.
        </p>

        {error && (
          <div
            className="mt-5 border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="mt-7 space-y-6"
          autoComplete="on"
          noValidate
        >
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field
              label="First name"
              id="firstName"
              value={form.firstName}
              onChange={update}
              required
              autoComplete="given-name"
            />
            <Field
              label="Last name"
              id="lastName"
              value={form.lastName}
              onChange={update}
              required
              autoComplete="family-name"
            />
            <Field
              label="Email"
              id="email"
              type="email"
              value={form.email}
              onChange={update}
              required
              autoComplete="username"
              className="sm:col-span-2"
            />
            <Field
              label="Phone"
              id="phoneNumber"
              value={form.phoneNumber}
              onChange={update}
              required
              autoComplete="tel"
              className="sm:col-span-2"
            />
            <GenderSelect value={gender} onChange={setGender} />
            <div className="relative z-10 space-y-1.5">
              <Label htmlFor="schoolId" className="text-[13px] text-zinc-600">
                School
              </Label>
              {schoolsLoading ? (
                <p className="text-[13px] text-zinc-400">Loading schools…</p>
              ) : schoolsError ? (
                <div className="space-y-2">
                  <p className="text-[13px] text-red-600">{schoolsError}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void loadSchools()}
                  >
                    Retry loading schools
                  </Button>
                </div>
              ) : schools.length === 0 ? (
                <p className="text-[13px] text-zinc-500">
                  No schools are available yet. Ask your administrator to add
                  your school first.
                </p>
              ) : (
                <select
                  id="schoolId"
                  name="schoolId"
                  value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value)}
                  required
                  className={selectInput}
                >
                  <option value="">Select your school</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name} — {school.city}, {school.province}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-[11px] text-zinc-400">
                Schools are created by a platform administrator.
              </p>
            </div>
            <Field
              label="Password"
              id="password"
              type="password"
              value={form.password}
              onChange={update}
              required
              minLength={8}
              autoComplete="new-password"
              preventEnterSubmit
              hint="At least 8 characters"
            />
            <Field
              label="Confirm password"
              id="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={update}
              required
              minLength={8}
              autoComplete="new-password"
              preventEnterSubmit
            />
            <div className="sm:col-span-2">
              <PasswordMatchHint
                password={form.password}
                confirmPassword={form.confirmPassword}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={pending || schoolsLoading || schools.length === 0}
            className="h-11 w-full rounded-md bg-[#0C1A2E] text-sm font-semibold text-white hover:bg-[#0C1A2E]/90"
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
