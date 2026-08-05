"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCheck, Trash2 } from "lucide-react";
import { notificationsApi } from "@/lib/api";
import type { AppNotification } from "@/lib/types";
import { toastFromError } from "@/lib/toast";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function formatWhen(iso: string) {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type ConfirmState =
  | { type: "one"; id: string; title: string }
  | { type: "all" }
  | null;

export default function NotificationsPage() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState>(null);

  const confirmOpen = confirm !== null;
  const confirming =
    confirm?.type === "all"
      ? clearing
      : confirm?.type === "one"
        ? busyId === confirm.id
        : false;

  const load = useCallback(async () => {
    try {
      const data = await notificationsApi.list();
      setItems(data.items);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      toastFromError(err, "Could not load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function markAllSeen() {
    try {
      await notificationsApi.markRead();
      setUnreadCount(0);
      setItems((prev) =>
        prev.map((n) =>
          n.readAt ? n : { ...n, readAt: new Date().toISOString() },
        ),
      );
    } catch (err) {
      toastFromError(err, "Could not mark as seen");
    }
  }

  async function removeOne(id: string) {
    setBusyId(id);
    try {
      await notificationsApi.remove(id);
      setItems((prev) => {
        const next = prev.filter((n) => n.id !== id);
        const wasUnread = prev.find((n) => n.id === id && !n.readAt);
        if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
        return next;
      });
      setConfirm(null);
    } catch (err) {
      toastFromError(err, "Could not delete notification");
    } finally {
      setBusyId(null);
    }
  }

  async function clearAll() {
    setClearing(true);
    try {
      await notificationsApi.clear();
      setItems([]);
      setUnreadCount(0);
      setConfirm(null);
    } catch (err) {
      toastFromError(err, "Could not clear notifications");
    } finally {
      setClearing(false);
    }
  }

  function onConfirmProceed() {
    if (!confirm) return;
    if (confirm.type === "all") {
      void clearAll();
      return;
    }
    void removeOne(confirm.id);
  }

  if (loading) {
    return <PageLoading label="Loading notifications…" />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description={
          unreadCount > 0
            ? `${unreadCount} unseen · ${items.length} total`
            : items.length === 0
              ? "You're all caught up."
              : `${items.length} notification${items.length === 1 ? "" : "s"}`
        }
        actions={
          <>
            {unreadCount > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void markAllSeen()}
              >
                <CheckCheck className="size-3.5" />
                Mark all seen
              </Button>
            )}
            {items.length > 0 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={clearing}
                onClick={() => setConfirm({ type: "all" })}
              >
                <Trash2 className="size-3.5" />
                Clear all
              </Button>
            )}
          </>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="New assignments, submissions, and grades will show up here."
        />
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {items.map((n) => {
            const unseen = !n.readAt;
            return (
              <li
                key={n.id}
                className={cn(
                  "group flex items-start gap-3 py-4 transition-colors",
                  unseen && "bg-brand/[0.03]",
                )}
              >
                <span
                  className={cn(
                    "mt-2 size-1.5 shrink-0 rounded-full",
                    unseen ? "bg-brand" : "bg-transparent",
                  )}
                />
                <div className="min-w-0 flex-1">
                  {n.href ? (
                    <Link
                      href={n.href}
                      className="text-[14px] font-medium text-brand-dark hover:underline"
                      onClick={() => {
                        if (unseen) {
                          void notificationsApi.markOne(n.id).then(() => {
                            setUnreadCount((c) => Math.max(0, c - 1));
                            setItems((prev) =>
                              prev.map((item) =>
                                item.id === n.id
                                  ? {
                                      ...item,
                                      readAt: new Date().toISOString(),
                                    }
                                  : item,
                              ),
                            );
                          });
                        }
                      }}
                    >
                      {n.title}
                    </Link>
                  ) : (
                    <p className="text-[14px] font-medium text-brand-dark">
                      {n.title}
                    </p>
                  )}
                  <p className="mt-0.5 text-[13px] leading-relaxed text-zinc-600">
                    {n.body}
                  </p>
                  <p className="mt-1.5 text-[11px] text-zinc-400">
                    {formatWhen(n.createdAt)}
                    {unseen ? " · Unseen" : ""}
                  </p>
                </div>
                <button
                  type="button"
                  title="Delete notification"
                  disabled={busyId === n.id}
                  onClick={() =>
                    setConfirm({ type: "one", id: n.id, title: n.title })
                  }
                  className="mt-0.5 flex size-8 shrink-0 items-center justify-center text-zinc-400 opacity-100 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open && !confirming) setConfirm(null);
        }}
      >
        <DialogContent showCloseButton={!confirming}>
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-semibold text-brand-dark">
              {confirm?.type === "all"
                ? "Clear all notifications?"
                : "Delete notification?"}
            </DialogTitle>
            <DialogDescription>
              {confirm?.type === "all" ? (
                <>
                  Are you sure you want to proceed? This will permanently delete
                  all notifications and cannot be undone.
                </>
              ) : (
                <>
                  Are you sure you want to proceed with deleting{" "}
                  <span className="font-semibold text-brand-dark">
                    {confirm?.title}
                  </span>
                  ? This cannot be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirm(null)}
              disabled={confirming}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => onConfirmProceed()}
              disabled={confirming}
            >
              {confirming ? "Deleting…" : "Proceed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
