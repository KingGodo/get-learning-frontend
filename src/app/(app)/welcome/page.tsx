"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { authApi } from "@/lib/api";
import { toast, toastFromError } from "@/lib/toast";
import type { TeacherOnboarding } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { Textarea } from "@/components/ui/textarea";

export default function TeacherWelcomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<TeacherOnboarding | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    department: "",
    qualification: "",
    note: "",
  });

  useEffect(() => {
    if (!user) return;
    if (user.role !== "TEACHER" || !user.mustChangePassword) {
      router.replace("/dashboard");
      return;
    }
    authApi
      .teacherOnboarding()
      .then((next) => {
        setData(next);
        setForm({
          firstName: next.profile.firstName,
          lastName: next.profile.lastName,
          phoneNumber: next.profile.phoneNumber,
          department: next.profile.department ?? "",
          qualification: next.profile.qualification ?? "",
          note: "",
        });
      })
      .catch((err) => toastFromError(err, "Could not load your profile"))
      .finally(() => setLoading(false));
  }, [user, router]);

  async function sendCorrections(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      await authApi.submitTeacherCorrections({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        department: form.department.trim() || undefined,
        qualification: form.qualification.trim() || undefined,
        note: form.note.trim() || undefined,
      });
      toast.success("Sent to your school admin");
      const next = await authApi.teacherOnboarding();
      setData(next);
      setEditing(false);
    } catch (err) {
      toastFromError(err, "Could not send corrections");
    } finally {
      setPending(false);
    }
  }

  if (loading || !data) {
    return <PageLoading label="Loading your profile…" />;
  }

  const profile = data.profile;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        eyebrow="First sign in"
        title="Review your details"
        description="Your school admin created this account and assigned your subjects. Confirm the details, or send corrections before you choose a password."
      />

      {data.pendingRequest && (
        <p className="border border-amber-200 bg-amber-50 px-3.5 py-3 text-[13px] text-amber-900">
          Corrections were sent to your school admin. You can set your password
          after they update your profile.
        </p>
      )}

      <section className="space-y-3 rounded-lg border border-border bg-card p-4">
        <Row label="School" value={profile.schoolName ?? "None"} />
        <Row label="Email" value={profile.email} />
        <Row label="Staff number" value={profile.employeeNumber} />
        <Row label="Name" value={`${profile.firstName} ${profile.lastName}`} />
        <Row label="Phone" value={profile.phoneNumber} />
        <Row label="Department" value={profile.department || "None"} />
        <Row label="Qualification" value={profile.qualification || "None"} />
        <div>
          <p className="text-[12px] text-muted-foreground">Subjects</p>
          <p className="text-sm text-ink">
            {data.subjects.length
              ? data.subjects.map((subject) => subject.name).join(", ")
              : "None"}
          </p>
        </div>
        <div>
          <p className="text-[12px] text-muted-foreground">Classes</p>
          <p className="text-sm text-ink">
            {data.classes.length
              ? data.classes.map((item) => item.name).join(", ")
              : "None"}
          </p>
        </div>
      </section>

      {!data.pendingRequest && !editing && (
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => router.push("/welcome/password")}>
            This is correct
          </Button>
          <Button type="button" variant="outline" onClick={() => setEditing(true)}>
            Something needs a change
          </Button>
        </div>
      )}

      {editing && !data.pendingRequest && (
        <form onSubmit={sendCorrections} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="firstName"
              label="First name"
              value={form.firstName}
              onChange={(value) => setForm((f) => ({ ...f, firstName: value }))}
            />
            <Field
              id="lastName"
              label="Last name"
              value={form.lastName}
              onChange={(value) => setForm((f) => ({ ...f, lastName: value }))}
            />
            <Field
              id="phoneNumber"
              label="Phone"
              value={form.phoneNumber}
              onChange={(value) => setForm((f) => ({ ...f, phoneNumber: value }))}
            />
            <Field
              id="department"
              label="Department"
              value={form.department}
              onChange={(value) => setForm((f) => ({ ...f, department: value }))}
            />
            <Field
              id="qualification"
              label="Qualification"
              value={form.qualification}
              onChange={(value) =>
                setForm((f) => ({ ...f, qualification: value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="note">Note for the school admin</Label>
            <Textarea
              id="note"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="For example, the subject or class is wrong"
              rows={3}
            />
          </div>
          <p className="text-[12px] text-muted-foreground">
            Subjects and classes stay with your school admin. Mention them in the note if they are wrong.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Sending…" : "Send to school admin"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[12px] text-muted-foreground">{label}</p>
      <p className="text-sm text-ink">{value}</p>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-md"
      />
    </div>
  );
}
