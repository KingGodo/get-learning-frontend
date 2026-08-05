"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiRequestError, usersApi } from "@/lib/api";
import { toastFromError } from "@/lib/toast";
import type { AdminUserDetail } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { StatusBadge, statusToneFor } from "@/components/ui/status-badge";

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-[12px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-[13px] text-ink">{value ?? "—"}</p>
    </div>
  );
}

export default function UserDetailPage() {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!authUser) return;
    if (authUser.role !== "ADMIN" && authUser.role !== "SCHOOL_ADMIN") {
      router.replace("/dashboard");
      return;
    }

    usersApi
      .get(id)
      .then(setUser)
      .catch((err) =>
        setError(
          err instanceof ApiRequestError
            ? err.message
            : "Failed to load user",
        ),
      )
      .finally(() => setLoading(false));
  }, [authUser, id, router]);

  if (
    !authUser ||
    (authUser.role !== "ADMIN" && authUser.role !== "SCHOOL_ADMIN") ||
    loading
  ) {
    return <PageLoading label="Loading user…" />;
  }

  async function onDelete() {
    if (!user) return;
    setDeleting(true);
    try {
      await usersApi.remove(user.id);
      setDeleteDialogOpen(false);
      router.replace("/users");
    } catch (err) {
      toastFromError(err, "Could not delete user");
      setDeleting(false);
    }
  }

  if (error || !user) {
    return (
      <div className="space-y-4">
        <Link
          href="/users"
          className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-brand-dark"
        >
          <ArrowLeft className="size-3.5" />
          Back to users
        </Link>
        <div
          className="border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
          role="alert"
        >
          {error ?? "User not found"}
        </div>
      </div>
    );
  }

  const fullName = [user.firstName, user.middleName, user.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/users"
          className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-brand-dark"
        >
          <ArrowLeft className="size-3.5" />
          Back to users
        </Link>
        <PageHeader
          eyebrow="User detail"
          title={fullName}
          description={user.email}
          className="mt-4 pb-0"
          actions={
            <>
              <ButtonLink href={`/users/${user.id}/edit`} variant="outline" size="sm">
                Edit
              </ButtonLink>
              {(authUser.role === "ADMIN" || user.role !== "SCHOOL_ADMIN") && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={deleting}
                >
                  {deleting ? "Deleting…" : "Delete"}
                </Button>
              )}
              <StatusBadge>
                {user.role === "SCHOOL_ADMIN"
                  ? "School admin"
                  : user.role.charAt(0) + user.role.slice(1).toLowerCase()}
              </StatusBadge>
              <StatusBadge tone={statusToneFor(user.status)}>
                {user.status.charAt(0) + user.status.slice(1).toLowerCase()}
              </StatusBadge>
            </>
          }
        />
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent showCloseButton={!deleting}>
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-semibold text-brand-dark">
              Delete user account?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to proceed with deleting{" "}
              <span className="font-semibold text-brand-dark">
                {user.firstName} {user.lastName}
              </span>
              ? This account will be deactivated and removed from people lists.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void onDelete()}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Proceed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <section className="space-y-4">
        <h2 className="text-[12px] font-medium text-muted-foreground">
          Personal
        </h2>
        <div className="grid gap-5 border-y border-border py-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Full name" value={fullName} />
          <Field label="Email" value={user.email} />
          <Field label="Phone" value={user.phoneNumber} />
          <Field label="Gender" value={user.gender} />
          <Field
            label="Date of birth"
            value={
              user.dateOfBirth
                ? new Date(user.dateOfBirth).toLocaleDateString()
                : null
            }
          />
          <Field
            label="Last login"
            value={
              user.lastLogin
                ? new Date(user.lastLogin).toLocaleString()
                : "Never"
            }
          />
          <Field
            label="Joined"
            value={new Date(user.createdAt).toLocaleString()}
          />
          <Field
            label="Email verified"
            value={user.emailVerified ? "Yes" : "No"}
          />
          <Field
            label="Phone verified"
            value={user.phoneVerified ? "Yes" : "No"}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-[12px] font-medium text-muted-foreground">School</h2>
        {user.school ? (
          <div className="grid gap-5 border-y border-border py-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Name"
              value={
                <Link
                  href={`/school/${user.school.id}`}
                  className="font-medium hover:underline"
                >
                  {user.school.name}
                </Link>
              }
            />
            <Field label="Code" value={user.school.code} />
            <Field label="Email" value={user.school.email} />
            <Field
              label="Location"
              value={`${user.school.city}, ${user.school.province}`}
            />
            <Field label="Status" value={user.school.status} />
          </div>
        ) : (
          <p className="border-y border-border py-5 text-[13px] text-zinc-500">
            Not linked to a school.
          </p>
        )}
      </section>

      {user.teacher && (
        <section className="space-y-4">
          <h2 className="text-[12px] font-medium text-muted-foreground">
            Teacher profile
          </h2>
          <div className="grid gap-5 border-y border-border py-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Employee number"
              value={user.teacher.employeeNumber}
            />
            <Field label="Department" value={user.teacher.department} />
            <Field
              label="Qualification"
              value={user.teacher.qualification}
            />
          </div>

          {user.teacher.classTeachers &&
            user.teacher.classTeachers.length > 0 && (
              <div className="overflow-x-auto pt-2">
                <table className="w-full min-w-[560px] text-left">
                  <thead>
                    <tr className="border-b border-border text-[11px] uppercase tracking-[0.08em] text-zinc-400">
                      <th className="py-3 pr-4 font-medium">Class</th>
                      <th className="px-4 py-3 font-medium">Subject</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 text-right font-medium">
                        Students
                      </th>
                      <th className="py-3 pl-4 text-right font-medium">
                        Assignments
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.teacher.classTeachers.map((ct) => (
                      <tr
                        key={ct.class.id}
                        className="border-b border-border text-[13px]"
                      >
                        <td className="py-3 pr-4 font-medium text-brand-dark">
                          {ct.class.name}
                          <span className="ml-2 font-mono text-[11px] text-zinc-400">
                            {ct.class.classCode}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-600">
                          {ct.class.subject
                            ? `${ct.class.subject.name} (${ct.class.subject.code})`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-zinc-500">
                          {ct.class.status}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-zinc-600">
                          {ct.class._count?.classStudents ?? 0}
                        </td>
                        <td className="py-3 pl-4 text-right tabular-nums text-zinc-600">
                          {ct.class._count?.assignments ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </section>
      )}

      {user.student && (
        <section className="space-y-4">
          <h2 className="text-[12px] font-medium text-muted-foreground">
            Student profile
          </h2>
          <div className="grid gap-5 border-y border-border py-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Student number"
              value={user.student.studentNumber}
            />
            <Field label="Guardian" value={user.student.guardianName} />
            <Field label="Guardian phone" value={user.student.guardianPhone} />
            <Field
              label="Guardian email"
              value={user.student.guardianEmail}
            />
            <Field
              label="Emergency contact"
              value={user.student.emergencyContact}
            />
            <Field
              label="Submissions"
              value={user.student._count?.submissions ?? 0}
            />
          </div>

          {user.student.classStudents &&
            user.student.classStudents.length > 0 && (
              <div className="overflow-x-auto pt-2">
                <table className="w-full min-w-[480px] text-left">
                  <thead>
                    <tr className="border-b border-border text-[11px] uppercase tracking-[0.08em] text-zinc-400">
                      <th className="py-3 pr-4 font-medium">Class</th>
                      <th className="px-4 py-3 font-medium">Subject</th>
                      <th className="py-3 pl-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.student.classStudents.map((cs) => (
                      <tr
                        key={cs.class.id}
                        className="border-b border-border text-[13px]"
                      >
                        <td className="py-3 pr-4 font-medium text-brand-dark">
                          {cs.class.name}
                          <span className="ml-2 font-mono text-[11px] text-zinc-400">
                            {cs.class.classCode}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-600">
                          {cs.class.subject
                            ? `${cs.class.subject.name} (${cs.class.subject.code})`
                            : "—"}
                        </td>
                        <td className="py-3 pl-4 text-zinc-500">
                          {cs.class.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </section>
      )}
    </div>
  );
}
