"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiRequestError, schoolsApi } from "@/lib/api";
import { toastFromError } from "@/lib/toast";
import type { School } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoading } from "@/components/ui/page-loading";

export default function EditSchoolPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const canManage = user?.role === "ADMIN" || user?.role === "SCHOOL_ADMIN";
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
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
    country: "",
    termSystem: "TERM" as "TERM" | "SEMESTER" | "QUARTER",
    termsPerYear: 3,
  });

  useEffect(() => {
    if (user && !canManage) {
      router.replace("/school");
      return;
    }

    schoolsApi
      .me()
      .then((data) => {
        setSchool(data);
        setForm({
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber ?? "",
          website: data.website ?? "",
          address: data.address ?? "",
          city: data.city,
          province: data.province,
          country: data.country ?? "",
          termSystem: (data.termSystem as "TERM" | "SEMESTER" | "QUARTER") ?? "TERM",
          termsPerYear: data.termsPerYear ?? 3,
        });
      })
      .catch((err) => {
        if (err instanceof ApiRequestError && err.status === 404) {
          router.replace("/school/new");
          return;
        }
        setError(
          err instanceof ApiRequestError
            ? err.message
            : "Failed to load school",
        );
      })
      .finally(() => setLoading(false));
  }, [user, canManage, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const updated = await schoolsApi.update({
        name: form.name,
        email: form.email,
        phoneNumber: form.phoneNumber || undefined,
        website: form.website || null,
        address: form.address || undefined,
        city: form.city,
        province: form.province,
        country: form.country || undefined,
        termSystem: form.termSystem,
        termsPerYear: form.termsPerYear,
      });
      setSchool(updated);
      await refreshUser();
      router.push("/school");
    } catch (err) {
      toastFromError(err, "Could not save");
      setPending(false);
    }
  }

  if (loading || !school) {
    return <PageLoading label="Loading school…" />;
  }

  return (
    <div className="relative mx-auto max-w-xl space-y-8">
      {pending && <PageLoading overlay label="Saving changes…" />}
      <div>
        <Link
          href="/school"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-500 transition-colors hover:text-brand-dark"
        >
          <ArrowLeft className="size-3.5" />
          Back to school
        </Link>
        <PageHeader
          title="Edit school"
          description={`Code ${school.code} cannot be changed.`}
          className="mt-4 pb-0"
        />
      </div>

      {error && (
        <div
          className="border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
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
              value={form.phoneNumber}
              onChange={(e) =>
                setForm((f) => ({ ...f, phoneNumber: e.target.value }))
              }
              className="h-9 rounded-md bg-transparent"
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
            placeholder="https://…"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address" className="text-[13px] text-zinc-600">
            Address
          </Label>
          <Input
            id="address"
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

        <div className="space-y-1.5 border-t border-border pt-6">
          <Label className="text-[13px] font-semibold text-brand-dark">
            Academic calendar
          </Label>
          <p className="text-[12px] text-zinc-500">
            How is the academic year divided at this school?
          </p>
          <div className="grid gap-4 pt-2 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="termSystem" className="text-[13px] text-zinc-600">
                System
              </Label>
              <select
                id="termSystem"
                value={form.termSystem}
                onChange={(e) => {
                  const system = e.target.value as "TERM" | "SEMESTER" | "QUARTER";
                  const defaults = { TERM: 3, SEMESTER: 2, QUARTER: 4 };
                  setForm((f) => ({
                    ...f,
                    termSystem: system,
                    termsPerYear: defaults[system],
                  }));
                }}
                className="h-9 w-full rounded-md border border-border bg-white px-2.5 text-sm"
              >
                <option value="TERM">Terms</option>
                <option value="SEMESTER">Semesters</option>
                <option value="QUARTER">Quarters</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="termsPerYear" className="text-[13px] text-zinc-600">
                Per year
              </Label>
              <select
                id="termsPerYear"
                value={form.termsPerYear}
                onChange={(e) =>
                  setForm((f) => ({ ...f, termsPerYear: Number(e.target.value) }))
                }
                className="h-9 w-full rounded-md border border-border bg-white px-2.5 text-sm"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            type="submit"
            disabled={pending}
            className="h-9 rounded-md bg-brand-dark px-5 text-sm font-medium text-white transition-colors hover:bg-brand-dark-hover"
          >
            {pending ? "Saving…" : "Save changes"}
          </Button>
          <Link
            href="/school"
            className="inline-flex h-9 items-center px-4 text-sm font-medium text-zinc-500 hover:text-brand-dark"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
