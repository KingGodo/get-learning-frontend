"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GenderSelect } from "@/components/auth/registration-fields";
import { useAuth } from "@/components/providers/auth-provider";
import { CredentialsPanel } from "@/components/users/credentials-panel";
import { OneOffPasswordField } from "@/components/users/one-off-password-field";
import { usersApi } from "@/lib/api";
import { toastFromError } from "@/lib/toast";
import type { IssuedCredentials } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageLoading } from "@/components/ui/page-loading";

type CreatedStudent = {
  name: string;
  credentials: IssuedCredentials;
  userId: string;
};

export default function NewStudentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const canCreate =
    user?.role === "SCHOOL_ADMIN" || user?.role === "ADMIN";
  const [checking, setChecking] = useState(true);
  const [pending, setPending] = useState(false);
  const [created, setCreated] = useState<CreatedStudent | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    gender: "PREFER_NOT_TO_SAY",
    password: "",
    guardianName: "",
    guardianPhone: "",
    guardianEmail: "",
    emergencyContact: "",
  });

  useEffect(() => {
    if (!user) return;
    if (!canCreate) {
      router.replace("/dashboard");
      return;
    }
    if (user.role === "ADMIN") {
      router.replace("/users");
      return;
    }
    setChecking(false);
  }, [user, canCreate, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const data = await usersApi.createStudent({
        firstName: form.firstName,
        middleName: form.middleName || undefined,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        gender: form.gender,
        ...(form.password.trim() ? { password: form.password.trim() } : {}),
        guardianName: form.guardianName,
        guardianPhone: form.guardianPhone,
        guardianEmail: form.guardianEmail || undefined,
        emergencyContact: form.emergencyContact || undefined,
      });
      setCreated({
        name: `${data.user.firstName} ${data.user.lastName}`,
        credentials: data.credentials,
        userId: data.user.id,
      });
      setPending(false);
    } catch (err) {
      toastFromError(err, "Could not create student");
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
          eyebrow="Student created"
          title={created.name}
          description="Share these credentials so they can sign in."
        />
        <CredentialsPanel
          credentials={created.credentials}
          footer={
            <div className="flex flex-wrap gap-2">
              <ButtonLink href={`/users/${created.userId}`} size="sm">
                View profile
              </ButtonLink>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setCreated(null);
                  setForm({
                    firstName: "",
                    middleName: "",
                    lastName: "",
                    email: "",
                    phoneNumber: "",
                    gender: "PREFER_NOT_TO_SAY",
                    password: "",
                    guardianName: "",
                    guardianPhone: "",
                    guardianEmail: "",
                    emergencyContact: "",
                  });
                }}
              >
                Add another
              </Button>
              <Link
                href="/users"
                className="inline-flex h-9 items-center px-4 text-sm font-medium text-zinc-500 hover:text-brand-dark"
              >
                Back to people
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-xl space-y-8">
      {pending && <PageLoading overlay label="Creating student…" />}
      <div>
        <Link
          href="/users"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-500 transition-colors hover:text-brand-dark"
        >
          <ArrowLeft className="size-3.5" />
          Back to people
        </Link>
        <PageHeader
          title="Add student"
          description="Creates an account for your school. Set a one-time password or leave it blank to generate one."
          className="mt-4 pb-0"
        />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className="text-[13px] text-zinc-600">
              First name
            </Label>
            <Input
              id="firstName"
              required
              value={form.firstName}
              onChange={(e) =>
                setForm((f) => ({ ...f, firstName: e.target.value }))
              }
              className="h-9 rounded-md bg-transparent"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="middleName" className="text-[13px] text-zinc-600">
              Middle name
            </Label>
            <Input
              id="middleName"
              value={form.middleName}
              onChange={(e) =>
                setForm((f) => ({ ...f, middleName: e.target.value }))
              }
              className="h-9 rounded-md bg-transparent"
              placeholder="Optional"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName" className="text-[13px] text-zinc-600">
              Last name
            </Label>
            <Input
              id="lastName"
              required
              value={form.lastName}
              onChange={(e) =>
                setForm((f) => ({ ...f, lastName: e.target.value }))
              }
              className="h-9 rounded-md bg-transparent"
            />
          </div>
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

        <GenderSelect
          value={form.gender}
          onChange={(value) => setForm((f) => ({ ...f, gender: value }))}
        />

        <OneOffPasswordField
          id="password"
          value={form.password}
          onChange={(password) => setForm((f) => ({ ...f, password }))}
        />

        <div className="border-t border-border pt-4">
          <h2 className="text-[13px] font-semibold text-brand-dark">Guardian</h2>
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="guardianName" className="text-[13px] text-zinc-600">
                  Guardian name
                </Label>
                <Input
                  id="guardianName"
                  required
                  value={form.guardianName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, guardianName: e.target.value }))
                  }
                  className="h-9 rounded-md bg-transparent"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="guardianPhone" className="text-[13px] text-zinc-600">
                  Guardian phone
                </Label>
                <Input
                  id="guardianPhone"
                  required
                  value={form.guardianPhone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, guardianPhone: e.target.value }))
                  }
                  className="h-9 rounded-md bg-transparent"
                  placeholder="+263…"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="guardianEmail" className="text-[13px] text-zinc-600">
                  Guardian email
                </Label>
                <Input
                  id="guardianEmail"
                  type="email"
                  value={form.guardianEmail}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, guardianEmail: e.target.value }))
                  }
                  className="h-9 rounded-md bg-transparent"
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="emergencyContact"
                  className="text-[13px] text-zinc-600"
                >
                  Emergency contact
                </Label>
                <Input
                  id="emergencyContact"
                  value={form.emergencyContact}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, emergencyContact: e.target.value }))
                  }
                  className="h-9 rounded-md bg-transparent"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="submit" disabled={pending} size="sm">
            {pending ? "Creating…" : "Create student"}
          </Button>
          <ButtonLink href="/users" variant="outline" size="sm">
            Cancel
          </ButtonLink>
        </div>
      </form>
    </div>
  );
}
