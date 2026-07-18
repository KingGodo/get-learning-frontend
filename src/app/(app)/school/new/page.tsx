"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiRequestError, schoolsApi, setToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageLoading } from "@/components/ui/page-loading";

export default function NewSchoolPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === "ADMIN";
  const canManage = isAdmin || user?.role === "TEACHER";
  const [checking, setChecking] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    website: "",
    address: "",
    city: "",
    province: "",
    country: "Zimbabwe",
  });

  useEffect(() => {
    if (!user) return;
    if (!canManage) {
      router.replace("/dashboard");
      return;
    }

    // Admins can always create schools for the platform.
    // Teachers may only create one if they are not already linked.
    if (isAdmin) {
      setChecking(false);
      return;
    }

    schoolsApi
      .me()
      .then(() => {
        router.replace("/school/edit");
      })
      .catch((err) => {
        if (!(err instanceof ApiRequestError && err.status === 404)) {
          setError(
            err instanceof ApiRequestError
              ? err.message
              : "Could not verify school",
          );
        }
      })
      .finally(() => setChecking(false));
  }, [user, canManage, isAdmin, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const data = await schoolsApi.create({
        name: form.name,
        email: form.email,
        phoneNumber: form.phoneNumber,
        website: form.website || undefined,
        address: form.address,
        city: form.city,
        province: form.province,
        country: form.country || undefined,
      });
      if (data.token) {
        setToken(data.token);
        await refreshUser();
      }
      router.push(isAdmin ? "/dashboard" : "/school");
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Could not create",
      );
      setPending(false);
    }
  }

  if (!user || checking) {
    return <PageLoading label="Loading…" />;
  }

  return (
    <div className="relative mx-auto max-w-xl space-y-8">
      {pending && <PageLoading overlay label="Creating school…" />}
      <div>
        <Link
          href={isAdmin ? "/dashboard" : "/school"}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-500 transition-colors hover:text-[#0C1A2E]"
        >
          <ArrowLeft className="size-3.5" />
          {isAdmin ? "Back to dashboard" : "Back to school"}
        </Link>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-[#0C1A2E]">
          Create a school
        </h1>
        <p className="mt-1 text-[13px] text-zinc-500">
          {isAdmin
            ? "Add a school to the platform. A unique school code is generated automatically."
            : "A school code is generated automatically and linked to your account."}
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
            School name
          </Label>
          <Input
            id="name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="h-9 rounded-md bg-transparent"
            placeholder="Northridge Academy"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[13px] text-zinc-600">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="h-9 rounded-md bg-transparent"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-[13px] text-zinc-600">
              Phone
            </Label>
            <Input
              id="phone"
              required
              value={form.phoneNumber}
              onChange={(e) =>
                setForm((f) => ({ ...f, phoneNumber: e.target.value }))
              }
              className="h-9 rounded-md bg-transparent"
              placeholder="+263…"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="website" className="text-[13px] text-zinc-600">
            Website
          </Label>
          <Input
            id="website"
            type="url"
            value={form.website}
            onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
            className="h-9 rounded-md bg-transparent"
            placeholder="https://… (optional)"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address" className="text-[13px] text-zinc-600">
            Address
          </Label>
          <Input
            id="address"
            required
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            className="h-9 rounded-md bg-transparent"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-[13px] text-zinc-600">
              City
            </Label>
            <Input
              id="city"
              required
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              className="h-9 rounded-md bg-transparent"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="province" className="text-[13px] text-zinc-600">
              Province
            </Label>
            <Input
              id="province"
              required
              value={form.province}
              onChange={(e) =>
                setForm((f) => ({ ...f, province: e.target.value }))
              }
              className="h-9 rounded-md bg-transparent"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="country" className="text-[13px] text-zinc-600">
              Country
            </Label>
            <Input
              id="country"
              value={form.country}
              onChange={(e) =>
                setForm((f) => ({ ...f, country: e.target.value }))
              }
              className="h-9 rounded-md bg-transparent"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            type="submit"
            disabled={pending}
            className="h-9 rounded-md bg-[#0C1A2E] px-5 text-sm font-semibold text-white hover:bg-[#0C1A2E]/90"
          >
            {pending ? "Creating…" : "Create school"}
          </Button>
          <Link
            href={isAdmin ? "/dashboard" : "/school"}
            className="inline-flex h-9 items-center px-4 text-sm font-medium text-zinc-500 hover:text-[#0C1A2E]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
