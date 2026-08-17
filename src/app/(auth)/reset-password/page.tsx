"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { AuthLoading } from "@/components/auth/auth-loading";
import { authApi } from "@/lib/api";
import { toastFromError } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_NAME } from "@/lib/brand";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") ?? "");
    setReady(true);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!token) {
      toast.error("This reset link is missing a token. Request a new one.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setPending(true);
    try {
      await authApi.resetPassword({ token, password, confirmPassword });
      setDone(true);
    } catch (err) {
      toastFromError(err, "Unable to reset password");
    } finally {
      setPending(false);
    }
  }

  if (!ready) {
    return null;
  }

  if (!token) {
    return (
      <div className="w-full max-w-[360px]">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-brand-dark">
          Invalid link
        </h1>
        <p className="mt-2 text-[14px] text-zinc-500">
          This password reset link is incomplete. Request a new one from the
          sign-in page.
        </p>
        <Link
          href="/forgot-password"
          className="mt-8 inline-flex h-10 w-full items-center justify-center rounded-md bg-brand-dark text-sm font-medium text-white transition-colors hover:bg-brand-dark-hover"
        >
          Request reset link
        </Link>
      </div>
    );
  }

  return (
    <>
      {pending && <AuthLoading label="Updating password…" />}
      <div className="w-full max-w-[360px]">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-brand-dark">
          Set new password
        </h1>
        <p className="mt-1.5 text-[14px] text-zinc-500">
          Choose a new password for your {APP_NAME} account.
        </p>

        {done ? (
          <div className="mt-8 space-y-4">
            <div
              className="rounded-md bg-emerald-50 px-3.5 py-3 text-[13px] text-emerald-800"
              role="status"
            >
              Password updated. You can sign in with your new password.
            </div>
            <Button
              type="button"
              onClick={() => router.replace("/login")}
              className="w-full"
            >
              Go to sign in
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-[13px] font-medium text-zinc-700"
              >
                New password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 rounded-md border-zinc-200 bg-white pr-10 pl-3 text-sm shadow-none focus-visible:border-brand-dark/30 focus-visible:ring-brand-dark/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <p className="text-[12px] text-zinc-400">At least 8 characters</p>
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="confirmPassword"
                className="text-[13px] font-medium text-zinc-700"
              >
                Confirm password
              </Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-10 rounded-md border-zinc-200 bg-white px-3 text-sm shadow-none focus-visible:border-brand-dark/30 focus-visible:ring-brand-dark/15"
              />
            </div>
            <Button type="submit" disabled={pending} className="mt-2 w-full">
              {pending ? "Updating…" : "Update password"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-[13px] text-zinc-500">
          <Link
            href="/login"
            className="font-medium text-brand-dark hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </>
  );
}
