"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiRequestError, auditApi } from "@/lib/api";
import { canViewSchoolWide } from "@/lib/roles";
import { toastFromError } from "@/lib/toast";
import type { AuditLogEntry } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListPagination } from "@/components/ui/list-pagination";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoading } from "@/components/ui/page-loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE = 25;

const ACTION_OPTIONS = [
  "ALL",
  "AUTH.LOGIN",
  "USER.CREATE",
  "USER.UPDATE",
  "USER.STATUS",
  "USER.DELETE",
  "USER.RESET_PASSWORD",
  "SCHOOL.CREATE",
  "SCHOOL.UPDATE",
  "CLASS.CREATE",
  "ASSIGNMENT.CREATE",
  "ASSIGNMENT.PUBLISH",
  "ASSIGNMENT.UPDATE",
  "SUBMISSION.GRADE",
] as const;

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function actorLabel(entry: AuditLogEntry) {
  if (!entry.actor) return entry.actorRole;
  return `${entry.actor.firstName} ${entry.actor.lastName}`;
}

export default function AuditPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [action, setAction] = useState<string>("ALL");
  const [entityType, setEntityType] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (!canViewSchoolWide(user.role)) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    if (!user || !canViewSchoolWide(user.role)) return;
    setLoading(true);
    setError(null);
    auditApi
      .list({
        page,
        pageSize: PAGE_SIZE,
        action: action === "ALL" ? undefined : action,
        entityType: entityType.trim() || undefined,
      })
      .then((data) => {
        setItems(data.items);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      })
      .catch((err) => {
        setError(
          err instanceof ApiRequestError
            ? err.message
            : "Could not load audit log",
        );
        toastFromError(err, "Could not load audit log");
      })
      .finally(() => setLoading(false));
  }, [user, page, action, entityType]);

  if (!user || !canViewSchoolWide(user.role)) {
    return <PageLoading label="Loading…" />;
  }

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-5xl flex-col space-y-6">
      <PageHeader
        eyebrow="Oversight"
        title="Audit log"
        description="Recent account and school actions. Newest first."
      />

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label className="text-[13px] text-muted-foreground">Action</Label>
          <Select
            value={action}
            onValueChange={(value) => {
              setAction(value ?? "ALL");
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-[220px] rounded-md">
              <SelectValue placeholder="All actions" />
            </SelectTrigger>
            <SelectContent>
              {ACTION_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option === "ALL" ? "All actions" : option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[13px] text-muted-foreground">Entity type</Label>
          <Input
            value={entityType}
            onChange={(e) => {
              setEntityType(e.target.value);
              setPage(1);
            }}
            placeholder="User, School, Class"
            className="h-9 w-[180px] rounded-md"
          />
        </div>
        {(action !== "ALL" || entityType) && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setAction("ALL");
              setEntityType("");
              setPage(1);
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {loading ? (
        <PageLoading label="Loading audit log…" />
      ) : error ? (
        <p
          className="border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : items.length === 0 ? (
        <EmptyState
          title="No audit entries yet"
          description="Actions like creating users, publishing assignments, and grading will appear here."
        />
      ) : (
        <>
          <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
            {items.map((entry) => (
              <li key={entry.id} className="px-4 py-3.5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-medium text-ink">
                      {entry.summary}
                    </p>
                    <p className="text-[12px] text-muted-foreground">
                      {entry.action}
                      {" · "}
                      {entry.entityType}
                      {entry.school ? ` · ${entry.school.name}` : ""}
                    </p>
                  </div>
                  <p className="shrink-0 text-[12px] text-muted-foreground">
                    {formatWhen(entry.createdAt)}
                  </p>
                </div>
                <p className="mt-1.5 text-[12px] text-zinc-500">
                  By {actorLabel(entry)}
                  {entry.ip ? ` · ${entry.ip}` : ""}
                </p>
              </li>
            ))}
          </ul>
          <ListPagination
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            total={total}
            page={page}
            totalPages={totalPages}
            onPrevious={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </>
      )}
    </div>
  );
}
