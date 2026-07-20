"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { AuthLoading } from "@/components/auth/auth-loading";
import { ApiRequestError, authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") ?? "");
    setReady(true);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("This reset link is missing a token. Request a new one.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    try {
      await authApi.resetPassword({ token, password, confirmPassword });
      setDone(true);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Unable to reset password",
      );
    } finally {
      setPending(false);
    }
  }

  if (!ready) {
    return null;
  }

  if (!token) {
    return (
      <div className="w-full max-w-[340px] rounded-lg bg-white px-6 py-7 shadow-[0_1px_3px_rgba(12,26,46,0.06),0_8px_24px_rgba(12,26,46,0.06)] ring-1 ring-zinc-950/5">
        <h1 className="text-xl font-semibold tracking-tight text-black">
          Invalid link
        </h1>
        <p className="mt-2 text-[13px] text-zinc-500">
          This password reset link is incomplete. Request a new one from the
          sign-in page.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-flex h-9 w-full items-center justify-center rounded-md bg-[#0C1A2E] text-sm font-semibold text-white hover:bg-[#0C1A2E]/90"
        >
          Request reset link
        </Link>
      </div>
    );
  }

  return (
    <>
      {pending && <AuthLoading label="Updating password…" />}
      <div className="w-full max-w-[340px] rounded-lg bg-white px-6 py-7 shadow-[0_1px_3px_rgba(12,26,46,0.06),0_8px_24px_rgba(12,26,46,0.06)] ring-1 ring-zinc-950/5">
        <h1 className="text-xl font-semibold tracking-tight text-black">
          Set new password
        </h1>
        <p className="mt-1 text-[13px] text-zinc-500">
          Choose a new password for your Lumen account.
        </p>

        {done ? (
          <div className="mt-7 space-y-4">
            <div
              className="border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-[13px] text-emerald-800"
              role="status"
            >
              Password updated. You can sign in with your new password.
            </div>
            <Button
              type="button"
              onClick={() => router.replace("/login")}
              className="h-9 w-full rounded-md bg-[#0C1A2E] text-sm font-semibold text-white hover:bg-[#0C1A2E]/90"
            >
              Go to sign in
            </Button>
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
              <Label htmlFor="password" className="text-[13px] text-zinc-600">
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
                  className="h-9 rounded-md border-zinc-200 bg-white pr-9 pl-2.5 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-zinc-400">At least 8 characters</p>
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="confirmPassword"
                className="text-[13px] text-zinc-600"
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
                className="h-9 rounded-md border-zinc-200 bg-white px-2.5 text-sm"
              />
            </div>
            <Button
              type="submit"
              disabled={pending}
              className="mt-1 h-9 w-full rounded-md bg-[#0C1A2E] text-sm font-semibold text-white hover:bg-[#0C1A2E]/90"
            >
              {pending ? "Updating…" : "Update password"}
            </Button>
          </form>
        )}

        <p className="mt-5 text-center text-[13px] text-zinc-500">
          <Link
            href="/login"
            className="font-medium text-[#0C1A2E] hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </>
  );
}
