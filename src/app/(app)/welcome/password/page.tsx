"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { authApi } from "@/lib/api";
import { toast, toastFromError } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import {
  firstFieldError,
  parseForm,
  type FieldErrors,
} from "@/lib/validation/form";
import { z } from "zod";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be at most 128 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

export default function TeacherPasswordPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!user || user.role !== "TEACHER" || !user.mustChangePassword) return;
    authApi
      .teacherOnboarding()
      .then((next) => {
        if (next.pendingRequest) router.replace("/welcome");
      })
      .catch(() => {});
  }, [user, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || user.role !== "TEACHER" || !user.mustChangePassword) {
      router.replace("/dashboard");
      return;
    }
    const parsed = parseForm(schema, { password, confirmPassword });
    if (!parsed.ok) {
      setFieldErrors(parsed.fieldErrors);
      toast.error(firstFieldError(parsed.fieldErrors) ?? "Check the form");
      return;
    }
    setFieldErrors({});
    setPending(true);
    try {
      await authApi.setInitialPassword(parsed.data);
      await refreshUser();
      toast.success("Password saved");
      router.replace("/dashboard");
    } catch (err) {
      toastFromError(err, "Could not save password");
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <PageHeader
        eyebrow="First sign in"
        title="Choose your password"
        description="This replaces the one time password from your school. Use one you will remember."
      />
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
            className="h-10 rounded-md"
          />
          <FieldError message={fieldErrors.password} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
            className="h-10 rounded-md"
          />
          <FieldError message={fieldErrors.confirmPassword} />
        </div>
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Saving…" : "Save password"}
        </Button>
      </form>
      <Link href="/welcome" className="text-[13px] font-medium text-brand">
        Back to review
      </Link>
    </div>
  );
}
