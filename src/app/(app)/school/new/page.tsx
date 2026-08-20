"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GenderSelect } from "@/components/auth/registration-fields";
import { useAuth } from "@/components/providers/auth-provider";
import { CredentialsPanel } from "@/components/users/credentials-panel";
import { OneOffPasswordField } from "@/components/users/one-off-password-field";
import { schoolsApi } from "@/lib/api";
import { toastFromError } from "@/lib/toast";
import type { IssuedCredentials, School } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { PageHeader } from "@/components/ui/page-header";
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
    termSystem: "TERM" as "TERM" | "SEMESTER" | "QUARTER",
    termsPerYear: 3,
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPhoneNumber: "",
    adminGender: "PREFER_NOT_TO_SAY",
    adminPassword: "",
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
        termSystem: form.termSystem,
        termsPerYear: form.termsPerYear,
        admin: {
          firstName: form.adminFirstName,
          lastName: form.adminLastName,
          email: form.adminEmail,
          phoneNumber: form.adminPhoneNumber,
          gender: form.adminGender,
          ...(form.adminPassword.trim()
            ? { password: form.adminPassword.trim() }
            : {}),
        },
      });
      setCreated({
        school: data.school,
        credentials: data.credentials,
        adminName: `${data.admin.firstName} ${data.admin.lastName}`,
      });
      setPending(false);
    } catch (err) {
      toastFromError(err, "Could not create school");
      setPending(false);
    }
  }

  if (!user || checking) {
    return <PageLoading label="Loading…" />;
  }

  if (created) {
    return (
      <div className="relative mx-auto max-w-xl space-y-8">
        <PageHeader
          eyebrow="School created"
          title={created.school.name}
          description={`Code ${created.school.code} · School admin account ready for ${created.adminName}.`}
        />

        <CredentialsPanel
          title="School admin credentials"
          description="Give these to the school administrator so they can sign in and create teachers and students."
          credentials={created.credentials}
          footer={
            <div className="flex flex-wrap gap-2">
              <ButtonLink href={`/school/${created.school.id}`} size="sm">
                View school
              </ButtonLink>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreated(null)}
              >
                Create another
              </Button>
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
        <PageHeader
          title="Create a school"
          description="Add the school and its school admin account. Set a one-time password or leave it blank to generate one."
          className="mt-4 pb-0"
        />
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
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

        <section className="space-y-4 border-t border-border pt-8">
          <div>
            <h2 className="text-[13px] font-semibold text-brand-dark">
              Academic calendar
            </h2>
            <p className="mt-0.5 text-[12px] text-zinc-500">
              How is the academic year divided? This determines the term/semester options when creating classes.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
                <option value="TERM">Terms (e.g. Zimbabwe, UK)</option>
                <option value="SEMESTER">Semesters (e.g. USA, universities)</option>
                <option value="QUARTER">Quarters (e.g. Japan, some US)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="termsPerYear" className="text-[13px] text-zinc-600">
                {form.termSystem === "SEMESTER" ? "Semesters" : form.termSystem === "QUARTER" ? "Quarters" : "Terms"} per year
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

          <p className="text-[12px] text-zinc-400">
            {form.termSystem === "TERM" && form.termsPerYear === 3 && "Most common in Zimbabwe, South Africa, and the UK."}
            {form.termSystem === "SEMESTER" && form.termsPerYear === 2 && "Standard for most universities and US high schools."}
            {form.termSystem === "QUARTER" && form.termsPerYear === 4 && "Used in Japan and some US school districts."}
          </p>
        </section>

        <section className="space-y-4 border-t border-border pt-8">
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

          <OneOffPasswordField
            id="adminPassword"
            value={form.adminPassword}
            onChange={(adminPassword) => setForm((f) => ({ ...f, adminPassword }))}
          />
        </section>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="submit" disabled={pending} size="sm">
            {pending ? "Creating…" : "Create school & admin"}
          </Button>
          <ButtonLink href="/dashboard" variant="outline" size="sm">
            Cancel
          </ButtonLink>
        </div>
      </form>
    </div>
  );
}
