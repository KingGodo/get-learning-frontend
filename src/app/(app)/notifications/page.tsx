"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { ApiRequestError, notificationsApi } from "@/lib/api";
import type { AppNotification } from "@/lib/types";
import { PageLoading } from "@/components/ui/page-loading";
import { Button } from "@/components/ui/button";
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

export default function NotificationsPage() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await notificationsApi.list();
      setItems(data.items);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Could not load notifications",
      );
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
      setError(
        err instanceof ApiRequestError ? err.message : "Could not mark as seen",
      );
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
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Could not delete notification",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function clearAll() {
    if (
      !window.confirm(
        "Delete all notifications? This cannot be undone.",
      )
    ) {
      return;
    }
    setClearing(true);
    try {
      await notificationsApi.clear();
      setItems([]);
      setUnreadCount(0);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Could not clear notifications",
      );
    } finally {
      setClearing(false);
    }
  }

  if (loading) {
    return <PageLoading label="Loading notifications…" />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
            Inbox
          </p>
          <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-[#0C1A2E]">
            Notifications
          </h1>
          <p className="mt-1 text-[13px] text-zinc-500">
            {unreadCount > 0
              ? `${unreadCount} unseen · ${items.length} total`
              : items.length === 0
                ? "You’re all caught up."
                : `${items.length} notification${items.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {unreadCount > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => void markAllSeen()}
              className="h-9 rounded-md border-zinc-200 text-[12px] font-semibold text-[#0C1A2E]"
            >
              <CheckCheck className="mr-1.5 size-3.5" />
              Mark all seen
            </Button>
          )}
          {items.length > 0 && (
            <Button
              type="button"
              variant="outline"
              disabled={clearing}
              onClick={() => void clearAll()}
              className="h-9 rounded-md border-zinc-200 text-[12px] font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="mr-1.5 size-3.5" />
              {clearing ? "Clearing…" : "Clear all"}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div
          className="border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center border border-dashed border-zinc-200 px-4 py-16 text-center">
          <Bell className="size-8 text-zinc-300" strokeWidth={1.5} />
          <p className="mt-4 text-sm font-medium text-[#0C1A2E]">
            No notifications
          </p>
          <p className="mt-1 max-w-xs text-[13px] text-zinc-500">
            New assignments, submissions, and grades will show up here.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-100 border-y border-zinc-200">
          {items.map((n) => {
            const unseen = !n.readAt;
            return (
              <li
                key={n.id}
                className={cn(
                  "group flex items-start gap-3 py-4 transition-colors",
                  unseen && "bg-[#197de1]/[0.03]",
                )}
              >
                <span
                  className={cn(
                    "mt-2 size-1.5 shrink-0 rounded-full",
                    unseen ? "bg-[#197de1]" : "bg-transparent",
                  )}
                />
                <div className="min-w-0 flex-1">
                  {n.href ? (
                    <Link
                      href={n.href}
                      className="text-[14px] font-medium text-[#0C1A2E] hover:underline"
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
                    <p className="text-[14px] font-medium text-[#0C1A2E]">
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
                  onClick={() => void removeOne(n.id)}
                  className="mt-0.5 flex size-8 shrink-0 items-center justify-center text-zinc-400 opacity-100 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
