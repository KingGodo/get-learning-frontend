"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLoading } from "@/components/auth/auth-loading";
import {
  Field,
  GenderSelect,
  PasswordMatchHint,
} from "@/components/auth/registration-fields";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiRequestError, authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function RegisterStudentPage() {
  const { setSession } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gender, setGender] = useState("PREFER_NOT_TO_SAY");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    guardianName: "",
    guardianPhone: "",
    guardianEmail: "",
  });

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

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
      const payload: Record<string, unknown> = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        password: form.password,
        gender,
        guardianName: form.guardianName,
        guardianPhone: form.guardianPhone,
      };
      if (form.guardianEmail.trim()) {
        payload.guardianEmail = form.guardianEmail.trim();
      }

      const data = await authApi.registerStudent(payload);
      setSession(data.token, { ...data.user, student: data.student });
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
          className="text-[13px] font-medium text-zinc-500 transition-colors hover:text-brand-dark"
        >
          ← Back
        </Link>

        <h1 className="mt-4 text-xl font-semibold tracking-tight text-black">
          Join as a student
        </h1>
        <p className="mt-1 text-[13px] text-zinc-500">
          Create your account, then enter a class code from your teacher.
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
          className="mt-7 space-y-8"
          autoComplete="on"
          noValidate
        >
          <section className="space-y-3.5">
            <div>
              <h2 className="text-sm font-semibold text-brand-dark">You</h2>
              <p className="mt-0.5 text-[12px] text-zinc-400">
                Required for your student account
              </p>
            </div>
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
          </section>

          <section className="space-y-3.5 border-t border-zinc-200 pt-7">
            <div>
              <h2 className="text-sm font-semibold text-brand-dark">Guardian</h2>
              <p className="mt-0.5 text-[12px] text-zinc-400">
                So we can reach someone if needed
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
                autoComplete="tel"
              />
              <Field
                label="Guardian email"
                id="guardianEmail"
                type="email"
                value={form.guardianEmail}
                onChange={update}
                className="sm:col-span-2"
                autoComplete="email"
              />
            </div>
          </section>

          <Button
            type="submit"
            disabled={pending}
            className="h-11 w-full rounded-md bg-brand-dark text-sm font-semibold text-white hover:bg-brand-dark/90"
          >
            Create account
          </Button>
        </form>

        <p className="mt-5 text-center text-[13px] text-zinc-500">
          Teaching instead?{" "}
          <Link
            href="/register/teacher"
            className="font-medium text-brand-dark hover:underline"
          >
            Teacher signup
          </Link>
        </p>
      </div>

      <Image
        src="/student.svg"
        alt=""
        width={240}
        height={190}
        className="pointer-events-none absolute bottom-4 right-4 hidden w-[min(28vw,220px)] select-none lg:block"
        priority
      />
    </>
  );
}
