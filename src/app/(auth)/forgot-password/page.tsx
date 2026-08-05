"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthLoading } from "@/components/auth/auth-loading";
import { authApi } from "@/lib/api";
import { toastFromError } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setDevResetUrl(null);
    setPending(true);
    try {
      const data = await authApi.forgotPassword(email.trim());
      setMessage(data.message);
      if (data.resetUrl) setDevResetUrl(data.resetUrl);
    } catch (err) {
      toastFromError(err, "Unable to start password reset");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {pending && <AuthLoading label="Sending reset link…" />}
      <div className="w-full max-w-[360px]">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-brand-dark">
          Forgot password
        </h1>
        <p className="mt-1.5 text-[14px] text-zinc-500">
          Enter your account email and we&apos;ll send a reset link.
        </p>

        {message ? (
          <div className="mt-8 space-y-4">
            <div
              className="rounded-md bg-emerald-50 px-3.5 py-3 text-[13px] text-emerald-800"
              role="status"
            >
              {message}
            </div>
            {devResetUrl && (
              <div className="rounded-md bg-zinc-50 px-3.5 py-3 text-[12px] text-zinc-600">
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
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-brand-dark text-sm font-medium text-white transition-colors hover:bg-brand-dark-hover"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[13px] font-medium text-zinc-700">
                Email
              </Label>
              <Input
                id="email"
                type="text"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 rounded-md border-zinc-200 bg-white px-3 text-sm shadow-none focus-visible:border-brand-dark/30 focus-visible:ring-brand-dark/15"
                placeholder="you@school.edu"
              />
            </div>
            <Button type="submit" disabled={pending} className="mt-2 w-full">
              {pending ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-[13px] text-zinc-500">
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
