"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GenderSelect } from "@/components/auth/registration-fields";
import { useAuth } from "@/components/providers/auth-provider";
import { CredentialsPanel } from "@/components/users/credentials-panel";
import { ApiRequestError, schoolsApi } from "@/lib/api";
import type { IssuedCredentials, School } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageLoading } from "@/components/ui/page-loading";

type CreatedResult = {
  school: School;
  credentials: IssuedCredentials;
  adminName: string;
};

export default function NewSchoolPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === "ADMIN";
  const [checking, setChecking] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedResult | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    website: "",
    address: "",
    city: "",
    province: "",
    country: "Zimbabwe",
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPhoneNumber: "",
    adminGender: "PREFER_NOT_TO_SAY",
  });

  useEffect(() => {
    if (!user) return;
    if (!isAdmin) {
      router.replace("/school");
      return;
    }
    setChecking(false);
  }, [user, isAdmin, router]);

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
        admin: {
          firstName: form.adminFirstName,
          lastName: form.adminLastName,
          email: form.adminEmail,
          phoneNumber: form.adminPhoneNumber,
          gender: form.adminGender,
        },
      });
      setCreated({
        school: data.school,
        credentials: data.credentials,
        adminName: `${data.admin.firstName} ${data.admin.lastName}`,
      });
      setPending(false);
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Could not create school",
      );
      setPending(false);
    }
  }

  if (!user || checking) {
    return <PageLoading label="Loading…" />;
  }

  if (created) {
    return (
      <div className="relative mx-auto max-w-xl space-y-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
            School created
          </p>
          <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-brand-dark">
            {created.school.name}
          </h1>
          <p className="mt-1 text-[13px] text-zinc-500">
            Code <span className="font-medium text-brand-dark">{created.school.code}</span>
            {" · "}
            School admin account ready for {created.adminName}.
          </p>
        </div>

        <CredentialsPanel
          title="School admin credentials"
          description="Give these to the school administrator so they can sign in and create teachers and students."
          credentials={created.credentials}
          footer={
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/school/${created.school.id}`}
                className="inline-flex h-9 items-center bg-brand-dark px-4 text-sm font-semibold text-white hover:bg-brand-dark/90"
              >
                View school
              </Link>
              <button
                type="button"
                onClick={() => setCreated(null)}
                className="inline-flex h-9 items-center border border-zinc-200 px-4 text-sm font-medium text-brand-dark hover:bg-zinc-50"
              >
                Create another
              </button>
              <Link
                href="/dashboard"
                className="inline-flex h-9 items-center px-4 text-sm font-medium text-zinc-500 hover:text-brand-dark"
              >
                Dashboard
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-xl space-y-8">
      {pending && <PageLoading overlay label="Creating school…" />}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-500 transition-colors hover:text-brand-dark"
        >
          <ArrowLeft className="size-3.5" />
          Back to dashboard
        </Link>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-brand-dark">
          Create a school
        </h1>
        <p className="mt-1 text-[13px] text-zinc-500">
          Add the school and its school admin account. A temporary password is
          generated automatically.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        {error && (
          <div
            className="border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}

        <section className="space-y-4">
          <div>
            <h2 className="text-[13px] font-semibold text-brand-dark">
              School details
            </h2>
            <p className="mt-0.5 text-[12px] text-zinc-500">
              A unique school code is generated automatically.
            </p>
          </div>

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
                School email
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
                School phone
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
        </section>

        <section className="space-y-4 border-t border-zinc-200/80 pt-8">
          <div>
            <h2 className="text-[13px] font-semibold text-brand-dark">
              School admin account
            </h2>
            <p className="mt-0.5 text-[12px] text-zinc-500">
              This person will create teachers and students for the school.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="adminFirstName" className="text-[13px] text-zinc-600">
                First name
              </Label>
              <Input
                id="adminFirstName"
                required
                value={form.adminFirstName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, adminFirstName: e.target.value }))
                }
                className="h-9 rounded-md bg-transparent"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="adminLastName" className="text-[13px] text-zinc-600">
                Last name
              </Label>
              <Input
                id="adminLastName"
                required
                value={form.adminLastName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, adminLastName: e.target.value }))
                }
                className="h-9 rounded-md bg-transparent"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="adminEmail" className="text-[13px] text-zinc-600">
                Email
              </Label>
              <Input
                id="adminEmail"
                type="email"
                required
                value={form.adminEmail}
                onChange={(e) =>
                  setForm((f) => ({ ...f, adminEmail: e.target.value }))
                }
                className="h-9 rounded-md bg-transparent"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="adminPhone" className="text-[13px] text-zinc-600">
                Phone
              </Label>
              <Input
                id="adminPhone"
                required
                value={form.adminPhoneNumber}
                onChange={(e) =>
                  setForm((f) => ({ ...f, adminPhoneNumber: e.target.value }))
                }
                className="h-9 rounded-md bg-transparent"
                placeholder="+263…"
              />
            </div>
          </div>

          <GenderSelect
            id="adminGender"
            value={form.adminGender}
            onChange={(value) => setForm((f) => ({ ...f, adminGender: value }))}
          />
        </section>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            type="submit"
            disabled={pending}
            className="h-9 rounded-md bg-brand-dark px-5 text-sm font-semibold text-white hover:bg-brand-dark/90"
          >
            {pending ? "Creating…" : "Create school & admin"}
          </Button>
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center px-4 text-sm font-medium text-zinc-500 hover:text-brand-dark"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
