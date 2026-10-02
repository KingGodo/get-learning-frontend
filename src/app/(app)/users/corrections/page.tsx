"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { usersApi } from "@/lib/api";
import { canManageUsers } from "@/lib/roles";
import { toast, toastFromError } from "@/lib/toast";
import type { TeacherProfileRequest } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoading } from "@/components/ui/page-loading";

export default function TeacherCorrectionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<TeacherProfileRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (!canManageUsers(user.role)) {
      router.replace("/dashboard");
      return;
    }
    usersApi
      .profileRequests()
      .then(setItems)
      .catch((err) => toastFromError(err, "Could not load corrections"))
      .finally(() => setLoading(false));
  }, [user, router]);

  async function apply(id: string) {
    setBusyId(id);
    try {
      await usersApi.applyProfileRequest(id);
      setItems((current) => current.filter((item) => item.id !== id));
      toast.success("Profile updated");
    } catch (err) {
      toastFromError(err, "Could not apply corrections");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <PageLoading label="Loading corrections…" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/users"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to people
      </Link>
      <PageHeader
        title="Profile corrections"
        description="Teachers send these on their first sign in when a detail needs a change."
      />
      {items.length === 0 ? (
        <EmptyState
          title="No corrections waiting"
          description="New requests from teachers will show up here."
        />
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="space-y-3 rounded-lg border border-border bg-card p-4">
              <div>
                <p className="text-sm font-semibold text-ink">
                  {item.teacher.firstName} {item.teacher.lastName}
                </p>
                <p className="text-[12px] text-muted-foreground">
                  {item.teacher.email}
                  {item.school ? ` · ${item.school.name}` : ""}
                </p>
              </div>
              <p className="text-sm text-ink">
                {item.firstName} {item.lastName} · {item.phoneNumber}
              </p>
              <p className="text-[13px] text-muted-foreground">
                Department: {item.department || "None"} · Qualification:{" "}
                {item.qualification || "None"}
              </p>
              {item.note && (
                <p className="text-[13px] text-ink">Note: {item.note}</p>
              )}
              <Button
                type="button"
                size="sm"
                disabled={busyId === item.id}
                onClick={() => apply(item.id)}
              >
                {busyId === item.id ? "Saving…" : "Apply corrections"}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
