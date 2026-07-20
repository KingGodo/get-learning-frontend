"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiRequestError, subjectsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageLoading } from "@/components/ui/page-loading";

export default function NewSubjectPage() {
  const { user } = useAuth();
  const router = useRouter();
  const canManage = user?.role === "ADMIN" || user?.role === "TEACHER";
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", code: "", description: "" });

  useEffect(() => {
    if (user && !canManage) router.replace("/subjects");
  }, [user, canManage, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await subjectsApi.create({
        name: form.name,
        code: form.code.trim().toUpperCase(),
        description: form.description || undefined,
      });
      router.push("/subjects");
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Could not create",
      );
      setPending(false);
    }
  }

  if (!user) {
    return <PageLoading label="Loading…" />;
  }

  return (
    <div className="relative mx-auto max-w-xl space-y-8">
      {pending && <PageLoading overlay label="Creating subject…" />}
      <div>
        <Link
          href="/subjects"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-500 transition-colors hover:text-[#0C1A2E]"
        >
          <ArrowLeft className="size-3.5" />
          Back to subjects
        </Link>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-[#0C1A2E]">
          Add a subject
        </h1>
        <p className="mt-1 text-[13px] text-zinc-500">
          Create a subject for your school and start teaching it. You can add
          more anytime.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div
            className="border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-[13px] text-zinc-600">
            Name
          </Label>
          <Input
            id="name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="h-9 rounded-md bg-transparent"
            placeholder="Mathematics"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="code" className="text-[13px] text-zinc-600">
            Code
          </Label>
          <Input
            id="code"
            required
            value={form.code}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                code: e.target.value.toUpperCase(),
              }))
            }
            className="h-9 rounded-md bg-transparent font-mono uppercase"
            placeholder="MATH"
          />
          <p className="text-[12px] text-zinc-400">
            Short unique code, stored in uppercase.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-[13px] text-zinc-600">
            Description
          </Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            className="rounded-md bg-transparent"
            rows={4}
            placeholder="Optional short description"
          />
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            type="submit"
            disabled={pending}
            className="h-9 rounded-md bg-[#0C1A2E] px-5 text-sm font-semibold text-white hover:bg-[#0C1A2E]/90"
          >
            {pending ? "Creating…" : "Create subject"}
          </Button>
          <Link
            href="/subjects"
            className="inline-flex h-9 items-center px-4 text-sm font-medium text-zinc-500 hover:text-[#0C1A2E]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
