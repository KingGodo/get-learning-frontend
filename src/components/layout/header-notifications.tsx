"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { notificationsApi } from "@/lib/api";
import type { AppNotification } from "@/lib/types";
import { toastFromError } from "@/lib/toast";
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
  });
}

export function HeaderNotifications() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set());
  const rootRef = useRef<HTMLDivElement>(null);
  const markedOnOpenRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!user) return null;
    try {
      const data = await notificationsApi.list();
      setItems(data.items);
      setUnreadCount(data.unreadCount);
      return data;
    } catch {
      setItems([]);
      setUnreadCount(0);
      return null;
    } finally {
      setLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
    if (!user) return;
    const id = window.setInterval(() => {
      notificationsApi
        .unreadCount()
        .then((d) => setUnreadCount(d.unreadCount))
        .catch(() => {});
    }, 45000);
    return () => window.clearInterval(id);
  }, [user, refresh]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        markedOnOpenRef.current = false;
        setHighlightIds(new Set());
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        markedOnOpenRef.current = false;
        setHighlightIds(new Set());
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  async function openPanel() {
    if (open) {
      setOpen(false);
      markedOnOpenRef.current = false;
      setHighlightIds(new Set());
      return;
    }

    setOpen(true);
    const data = await refresh();
    if (!data || markedOnOpenRef.current) return;

    const unseen = data.items.filter((n) => !n.readAt).map((n) => n.id);
    setHighlightIds(new Set(unseen));
    markedOnOpenRef.current = true;

    if (unseen.length === 0) return;

    try {
      await notificationsApi.markRead(unseen);
      setUnreadCount(0);
      setItems((prev) =>
        prev.map((n) =>
          unseen.includes(n.id)
            ? { ...n, readAt: n.readAt ?? new Date().toISOString() }
            : n,
        ),
      );
    } catch (err) {
      toastFromError(err, "Could not mark notifications as seen");
    }
  }

  async function markAllRead() {
    try {
      await notificationsApi.markRead();
      setUnreadCount(0);
      setHighlightIds(new Set());
      setItems((prev) =>
        prev.map((n) =>
          n.readAt ? n : { ...n, readAt: new Date().toISOString() },
        ),
      );
    } catch (err) {
      toastFromError(err, "Could not mark as seen");
    }
  }

  const badge =
    unreadCount > 99 ? "99+" : unreadCount > 0 ? String(unreadCount) : null;

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => void openPanel()}
        className={cn(
          "relative flex size-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-ink",
          open && "border-brand/20 bg-brand-light text-brand",
        )}
        aria-label={
          unreadCount > 0
            ? `${unreadCount} unread notifications`
            : "Notifications"
        }
        aria-expanded={open}
      >
        <Bell className="size-4" strokeWidth={1.75} />
        {badge && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-semibold text-white">
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-3 top-[4.25rem] z-50 overflow-hidden rounded-lg border border-border bg-card shadow-[0_8px_24px_rgba(15,23,42,0.08)] sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:w-[min(92vw,360px)]">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div>
              <p className="text-[13px] font-semibold text-ink">
                Notifications
              </p>
              <p className="text-[11px] text-muted-foreground">
                {highlightIds.size > 0
                  ? `${highlightIds.size} just seen`
                  : "All caught up"}
              </p>
            </div>
            {(unreadCount > 0 || highlightIds.size > 0) && (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-brand"
              >
                Mark all seen
              </button>
            )}
          </div>

          {!loaded ? (
            <p className="px-4 py-8 text-center text-[13px] text-zinc-400">
              Loading…
            </p>
          ) : items.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-zinc-400">
              No notifications yet.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {items.map((n) => {
                const highlight = highlightIds.has(n.id);
                const content = (
                  <div className="flex items-start gap-2.5">
                    {highlight ? (
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                    ) : (
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-transparent" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-[13px] text-brand-dark",
                          highlight ? "font-semibold" : "font-medium",
                        )}
                      >
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-[12px] leading-relaxed text-zinc-500">
                        {n.body}
                      </p>
                      <p className="mt-1 text-[11px] text-zinc-400">
                        {formatWhen(n.createdAt)}
                      </p>
                    </div>
                  </div>
                );

                return (
                  <li
                    key={n.id}
                    className={cn(
                      "border-b border-zinc-100 last:border-b-0",
                      highlight && "bg-brand/[0.04]",
                    )}
                  >
                    {n.href ? (
                      <Link
                        href={n.href}
                        onClick={() => {
                          setOpen(false);
                          markedOnOpenRef.current = false;
                          setHighlightIds(new Set());
                        }}
                        className="block px-4 py-3 transition-colors hover:bg-zinc-50"
                      >
                        {content}
                      </Link>
                    ) : (
                      <div className="px-4 py-3">{content}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <div className="border-t border-zinc-100 px-4 py-2.5">
            <Link
              href="/notifications"
              onClick={() => {
                setOpen(false);
                markedOnOpenRef.current = false;
                setHighlightIds(new Set());
              }}
              className="block text-center text-[12px] font-semibold text-brand-dark transition-colors hover:underline"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
