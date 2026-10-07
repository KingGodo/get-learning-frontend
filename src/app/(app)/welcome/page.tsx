"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { authApi } from "@/lib/api";
import { toast, toastFromError } from "@/lib/toast";
import type { StudentOnboarding, TeacherOnboarding } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { Textarea } from "@/components/ui/textarea";

export default function TeacherWelcomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [teacherData, setTeacherData] = useState<TeacherOnboarding | null>(null);
  const [studentData, setStudentData] = useState<StudentOnboarding | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    department: "",
    qualification: "",
    guardianName: "",
    guardianPhone: "",
    guardianEmail: "",
    emergencyContact: "",
    note: "",
  });

  const isStudent = user?.role === "STUDENT";

  useEffect(() => {
    if (!user) return;
    if (
      (user.role !== "TEACHER" && user.role !== "STUDENT") ||
      !user.mustChangePassword
    ) {
      router.replace("/dashboard");
      return;
    }
    const load = user.role === "STUDENT"
      ? authApi.studentOnboarding().then((next) => {
          setStudentData(next);
          setForm({
            firstName: next.profile.firstName,
            lastName: next.profile.lastName,
            phoneNumber: next.profile.phoneNumber,
            department: "",
            qualification: "",
            guardianName: next.profile.guardianName,
            guardianPhone: next.profile.guardianPhone,
            guardianEmail: next.profile.guardianEmail ?? "",
            emergencyContact: next.profile.emergencyContact ?? "",
            note: "",
          });
        })
      : authApi.teacherOnboarding().then((next) => {
          setTeacherData(next);
          setForm({
            firstName: next.profile.firstName,
            lastName: next.profile.lastName,
            phoneNumber: next.profile.phoneNumber,
            department: next.profile.department ?? "",
            qualification: next.profile.qualification ?? "",
            guardianName: "",
            guardianPhone: "",
            guardianEmail: "",
            emergencyContact: "",
            note: "",
          });
        });
    load
      .catch((err) => toastFromError(err, "Could not load your profile"))
      .finally(() => setLoading(false));
  }, [user, router]);

  async function sendCorrections(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      if (isStudent) {
        await authApi.submitStudentCorrections({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phoneNumber: form.phoneNumber.trim(),
          guardianName: form.guardianName.trim(),
          guardianPhone: form.guardianPhone.trim(),
          guardianEmail: form.guardianEmail.trim() || undefined,
          emergencyContact: form.emergencyContact.trim() || undefined,
          note: form.note.trim() || undefined,
        });
        setStudentData(await authApi.studentOnboarding());
      } else {
        await authApi.submitTeacherCorrections({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phoneNumber: form.phoneNumber.trim(),
          department: form.department.trim() || undefined,
          qualification: form.qualification.trim() || undefined,
          note: form.note.trim() || undefined,
        });
        setTeacherData(await authApi.teacherOnboarding());
      }
      toast.success("Sent to your school admin");
      setEditing(false);
    } catch (err) {
      toastFromError(err, "Could not send corrections");
    } finally {
      setPending(false);
    }
  }

  const data = isStudent ? studentData : teacherData;

  if (loading || !data) {
    return <PageLoading label="Loading your profile…" />;
  }

  const profile = data.profile;
  const studentProfile = isStudent ? studentData?.profile : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        eyebrow="First sign in"
        title="Review your details"
        description={
          isStudent
            ? "Your school created this account. Confirm the details, or send corrections before you choose a password."
            : "Your school admin created this account and assigned your subjects. Confirm the details, or send corrections before you choose a password."
        }
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
        <Row
          label={isStudent ? "Student number" : "Staff number"}
          value={
            studentProfile
              ? studentProfile.studentNumber
              : teacherData?.profile.employeeNumber ?? "None"
          }
        />
        <Row label="Name" value={`${profile.firstName} ${profile.lastName}`} />
        <Row label="Phone" value={profile.phoneNumber} />
        {studentProfile ? (
          <>
            <Row label="Guardian" value={studentProfile.guardianName} />
            <Row label="Guardian phone" value={studentProfile.guardianPhone} />
            <Row
              label="Guardian email"
              value={studentProfile.guardianEmail || "None"}
            />
            <Row
              label="Emergency contact"
              value={studentProfile.emergencyContact || "None"}
            />
          </>
        ) : (
          <>
            <Row label="Department" value={teacherData?.profile.department || "None"} />
            <Row
              label="Qualification"
              value={teacherData?.profile.qualification || "None"}
            />
            <div>
              <p className="text-[12px] text-muted-foreground">Subjects</p>
              <p className="text-sm text-ink">
                {teacherData?.subjects.length
                  ? teacherData.subjects.map((subject) => subject.name).join(", ")
                  : "None"}
              </p>
            </div>
          </>
        )}
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
            {isStudent ? (
              <>
                <Field
                  id="guardianName"
                  label="Guardian name"
                  value={form.guardianName}
                  onChange={(value) =>
                    setForm((f) => ({ ...f, guardianName: value }))
                  }
                />
                <Field
                  id="guardianPhone"
                  label="Guardian phone"
                  value={form.guardianPhone}
                  onChange={(value) =>
                    setForm((f) => ({ ...f, guardianPhone: value }))
                  }
                />
                <Field
                  id="guardianEmail"
                  label="Guardian email"
                  value={form.guardianEmail}
                  onChange={(value) =>
                    setForm((f) => ({ ...f, guardianEmail: value }))
                  }
                />
                <Field
                  id="emergencyContact"
                  label="Emergency contact"
                  value={form.emergencyContact}
                  onChange={(value) =>
                    setForm((f) => ({ ...f, emergencyContact: value }))
                  }
                />
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="note">Note for the school admin</Label>
            <Textarea
              id="note"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder={
                isStudent
                  ? "For example, the class is wrong"
                  : "For example, the subject or class is wrong"
              }
              rows={3}
            />
          </div>
          <p className="text-[12px] text-muted-foreground">
            {isStudent
              ? "Classes stay with your school admin. Mention them in the note if they are wrong."
              : "Subjects and classes stay with your school admin. Mention them in the note if they are wrong."}
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
