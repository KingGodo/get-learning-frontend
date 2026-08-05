"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { AuthLoading } from "@/components/auth/auth-loading";
import { useAuth } from "@/components/providers/auth-provider";
import { clearToken } from "@/lib/api";
import { toastFromError } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const { login, logout } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    clearToken();
    logout();
  }, [logout]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    clearToken();
    try {
      await login(email.trim(), password);
      router.replace("/dashboard");
    } catch (err) {
      toastFromError(err, "Unable to sign in");
      setPending(false);
    }
  }

  return (
    <>
      {pending && <AuthLoading label="Signing in…" />}
      <div className="w-full max-w-[400px]">
        <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
          <h1 className="text-[1.35rem] font-semibold tracking-tight text-ink">
            Sign in
          </h1>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            Continue to Learning Hub
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-[13px] font-medium text-slate-700"
              >
                Email
              </Label>
              <Input
                id="email"
                type="text"
                inputMode="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 rounded-md border-border bg-background px-3 text-sm shadow-none focus-visible:border-brand/40 focus-visible:ring-brand/15"
                placeholder="you@school.edu"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-[13px] font-medium text-slate-700"
                >
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-[12px] font-medium text-muted-foreground transition-colors hover:text-brand"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 rounded-md border-border bg-background pr-10 pl-3 text-sm shadow-none focus-visible:border-brand/40 focus-visible:ring-brand/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={pending}
              size="default"
              className="mt-2 w-full"
            >
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-[13px] text-muted-foreground">
          Need an account?{" "}
          <Link
            href="/register"
            className="font-medium text-brand hover:underline"
          >
            Ask your school admin
          </Link>
        </p>
      </div>
    </>
  );
}
