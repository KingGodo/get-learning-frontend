"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GenderSelect } from "@/components/auth/registration-fields";
import { useAuth } from "@/components/providers/auth-provider";
import { CredentialsPanel } from "@/components/users/credentials-panel";
import { ApiRequestError, usersApi } from "@/lib/api";
import type { IssuedCredentials } from "@/lib/types";
import { Button } from "@/components/ui/button";
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
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedStudent | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    gender: "PREFER_NOT_TO_SAY",
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
    setError(null);
    setPending(true);
    try {
      const data = await usersApi.createStudent({
        firstName: form.firstName,
        middleName: form.middleName || undefined,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        gender: form.gender,
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
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Could not create student",
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
            Student created
          </p>
          <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-brand-dark">
            {created.name}
          </h1>
          <p className="mt-1 text-[13px] text-zinc-500">
            Share these credentials so they can sign in.
          </p>
        </div>
        <CredentialsPanel
          credentials={created.credentials}
          footer={
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/users/${created.userId}`}
                className="inline-flex h-9 items-center bg-brand-dark px-4 text-sm font-semibold text-white hover:bg-brand-dark/90"
              >
                View profile
              </Link>
              <button
                type="button"
                onClick={() => {
                  setCreated(null);
                  setForm({
                    firstName: "",
                    middleName: "",
                    lastName: "",
                    email: "",
                    phoneNumber: "",
                    gender: "PREFER_NOT_TO_SAY",
                    guardianName: "",
                    guardianPhone: "",
                    guardianEmail: "",
                    emergencyContact: "",
                  });
                }}
                className="inline-flex h-9 items-center border border-zinc-200 px-4 text-sm font-medium text-brand-dark hover:bg-zinc-50"
              >
                Add another
              </button>
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
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-brand-dark">
          Add student
        </h1>
        <p className="mt-1 text-[13px] text-zinc-500">
          Creates an account for your school and issues a temporary password.
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

        <div className="border-t border-zinc-200/80 pt-4">
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
          <Button
            type="submit"
            disabled={pending}
            className="h-9 rounded-md bg-brand-dark px-5 text-sm font-semibold text-white hover:bg-brand-dark/90"
          >
            {pending ? "Creating…" : "Create student"}
          </Button>
          <Link
            href="/users"
            className="inline-flex h-9 items-center px-4 text-sm font-medium text-zinc-500 hover:text-brand-dark"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
