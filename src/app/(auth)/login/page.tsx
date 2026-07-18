"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLoading } from "@/components/auth/auth-loading";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiRequestError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Unable to sign in",
      );
      setPending(false);
    }
  }

  return (
    <>
      {pending && <AuthLoading label="Signing in…" />}
      <div className="w-full max-w-[340px] rounded-lg bg-white px-6 py-7 shadow-[0_1px_3px_rgba(12,26,46,0.06),0_8px_24px_rgba(12,26,46,0.06)] ring-1 ring-zinc-950/5">
        <h1 className="text-xl font-semibold tracking-tight text-black">
          Sign in
        </h1>
        <p className="mt-1 text-[13px] text-zinc-500">to continue to Lumen</p>

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
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[13px] text-zinc-600">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-9 rounded-md border-zinc-200 bg-white px-2.5 text-sm"
            />
          </div>
          <Button
            type="submit"
            disabled={pending}
            className="mt-1 h-9 w-full rounded-md bg-[#0C1A2E] text-sm font-semibold text-white hover:bg-[#0C1A2E]/90"
          >
            {pending ? "Signing in…" : "Continue"}
          </Button>
        </form>

        <p className="mt-5 text-center text-[13px] text-zinc-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-[#0C1A2E] hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>

      <Image
        src="/login.svg"
        alt=""
        width={280}
        height={220}
        className="pointer-events-none absolute bottom-4 right-4 w-[min(40vw,280px)] select-none sm:bottom-6 sm:right-8"
        priority
      />
    </>
  );
}
