"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthLoading } from "@/components/auth/auth-loading";
import { ApiRequestError, authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setDevResetUrl(null);
    setPending(true);
    try {
      const data = await authApi.forgotPassword(email);
      setMessage(data.message);
      if (data.resetUrl) setDevResetUrl(data.resetUrl);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Unable to start password reset",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {pending && <AuthLoading label="Sending reset link…" />}
      <div className="w-full max-w-[340px] rounded-lg bg-white px-6 py-7 shadow-[0_1px_3px_rgba(12,26,46,0.06),0_8px_24px_rgba(12,26,46,0.06)] ring-1 ring-zinc-950/5">
        <h1 className="text-xl font-semibold tracking-tight text-black">
          Forgot password
        </h1>
        <p className="mt-1 text-[13px] text-zinc-500">
          Enter your account email and we&apos;ll send a reset link.
        </p>

        {message ? (
          <div className="mt-7 space-y-4">
            <div
              className="border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-[13px] text-emerald-800"
              role="status"
            >
              {message}
            </div>
            {devResetUrl && (
              <div className="border border-zinc-200 bg-zinc-50 px-3.5 py-3 text-[12px] text-zinc-600">
                <p className="font-medium text-brand-dark">Dev reset link</p>
                <Link
                  href={devResetUrl}
                  className="mt-1.5 block break-all text-brand-dark underline-offset-2 hover:underline"
                >
                  {devResetUrl}
                </Link>
              </div>
            )}
            <Link
              href="/login"
              className="inline-flex h-9 w-full items-center justify-center rounded-md bg-brand-dark text-sm font-semibold text-white hover:bg-brand-dark/90"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-7 space-y-3.5">
            {error && (
              <div
                className="border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
                role="alert"
              >
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[13px] text-zinc-600">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 rounded-md border-zinc-200 bg-white px-2.5 text-sm"
                placeholder="you@school.edu"
              />
            </div>
            <Button
              type="submit"
              disabled={pending}
              className="mt-1 h-9 w-full rounded-md bg-brand-dark text-sm font-semibold text-white hover:bg-brand-dark/90"
            >
              {pending ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        )}

        <p className="mt-5 text-center text-[13px] text-zinc-500">
          Remembered it?{" "}
          <Link
            href="/login"
            className="font-medium text-brand-dark hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}
