"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { chatApi } from "@/lib/api";
import { toastFromError } from "@/lib/toast";
import type { ChatInbox, ChatMessage, ChatRoomSummary } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

function roleLabel(role: string) {
  if (role === "TEACHER") return "Teacher";
  if (role === "STUDENT") return "Student";
  if (role === "PARENT") return "Parent";
  if (role === "HEADMASTER") return "Headmaster";
  return role;
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function MessagesScreen() {
  const searchParams = useSearchParams();
  const classId = searchParams.get("classId");
  const [inbox, setInbox] = useState<ChatInbox | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const openedClass = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const active = inbox?.rooms.find((room) => room.id === activeId) ?? null;

  async function refreshInbox() {
    const data = await chatApi.inbox();
    setInbox(data);
    return data;
  }

  useEffect(() => {
    refreshInbox()
      .catch((err) => toastFromError(err, "Could not load messages"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!classId || openedClass.current === classId) return;
    openedClass.current = classId;
    chatApi
      .open({ kind: "CLASS", classId })
      .then(async (room) => {
        setActiveId(room.id);
        await refreshInbox();
      })
      .catch((err) => toastFromError(err, "Could not open the class chat"));
  }, [classId]);

  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    chatApi
      .messages(activeId)
      .then((data) => {
        if (!cancelled) setMessages(data.messages);
      })
      .catch((err) => toastFromError(err, "Could not load the conversation"));
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  useEffect(() => {
    if (!activeId) return;
    const timer = window.setInterval(() => {
      const after = messages[messages.length - 1]?.createdAt;
      chatApi
        .messages(activeId, after)
        .then((data) => {
          if (data.messages.length === 0) return;
          setMessages((current) => {
            const ids = new Set(current.map((message) => message.id));
            const next = data.messages.filter((message) => !ids.has(message.id));
            return next.length > 0 ? [...current, ...next] : current;
          });
        })
        .catch(() => undefined);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [activeId, messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, activeId]);

  async function openStart(body: Record<string, unknown>) {
    try {
      const room = await chatApi.open(body);
      setActiveId(room.id);
      await refreshInbox();
    } catch (err) {
      toastFromError(err, "Could not open the conversation");
    }
  }

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!activeId || !body) return;
    setSending(true);
    try {
      const message = await chatApi.send(activeId, body);
      setDraft("");
      setMessages((current) =>
        current.some((item) => item.id === message.id)
          ? current
          : [...current, message],
      );
      await refreshInbox();
    } catch (err) {
      toastFromError(err, "Could not send the message");
    } finally {
      setSending(false);
    }
  }

  if (loading || !inbox) {
    return <PageLoading label="Loading messages…" />;
  }

  const starts = inbox.starts;

  return (
    <div className="flex min-h-[calc(100svh-8.5rem)] flex-col gap-4">
      <PageHeader
        eyebrow="Messages"
        title="Conversations"
        description="A class shares one chat. A parent can also talk with a teacher, and with the headmaster."
        className="pb-0"
      />

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside
          className={cn(
            "flex max-h-[70vh] flex-col overflow-hidden rounded-lg border border-border bg-card lg:max-h-none",
            active ? "hidden lg:flex" : "flex",
          )}
        >
          <div className="min-h-0 flex-1 overflow-y-auto">
            {inbox.rooms.length === 0 ? (
              <p className="px-4 py-4 text-[13px] text-muted-foreground">
                No conversations yet. Start one from the list below.
              </p>
            ) : (
              <ul>
                {inbox.rooms.map((room) => (
                  <li key={room.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(room.id)}
                      className={cn(
                        "w-full px-4 py-3 text-left transition-colors hover:bg-muted/60",
                        room.id === activeId && "bg-brand-light",
                      )}
                    >
                      <p className="truncate text-sm font-medium text-ink">
                        {room.title}
                      </p>
                      <p className="truncate text-[12px] text-muted-foreground">
                        {room.subtitle}
                        {room.lastMessage ? ` · ${room.lastMessage.body}` : ""}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <StartList starts={starts} onOpen={openStart} />
          </div>
        </aside>

        <section
          className={cn(
            "flex min-h-[28rem] flex-col rounded-lg border border-border bg-card",
            active ? "flex" : "hidden lg:flex",
          )}
        >
          {!active ? (
            <EmptyState
              title="Choose a conversation"
              description="Open a class chat, or start one with a teacher, a parent, or the headmaster."
            />
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <button
                  type="button"
                  className="text-[13px] font-medium text-muted-foreground lg:hidden"
                  onClick={() => setActiveId(null)}
                >
                  Back
                </button>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {active.title}
                  </p>
                  <p className="truncate text-[12px] text-muted-foreground">
                    {active.subtitle}
                  </p>
                </div>
              </div>
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {messages.length === 0 ? (
                  <p className="text-[13px] text-muted-foreground">
                    No messages yet. Send the first one.
                  </p>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "max-w-[85%] rounded-lg px-3 py-2",
                        message.mine
                          ? "ml-auto bg-brand text-white"
                          : "bg-muted text-ink",
                      )}
                    >
                      {!message.mine && (
                        <p className="text-[11px] font-medium text-muted-foreground">
                          {message.sender.name} · {roleLabel(message.sender.role)}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap text-sm">{message.body}</p>
                      <p
                        className={cn(
                          "mt-1 text-[11px]",
                          message.mine ? "text-white/80" : "text-muted-foreground",
                        )}
                      >
                        {formatWhen(message.createdAt)}
                      </p>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={onSend} className="border-t border-border p-3">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={2}
                  placeholder="Write a message"
                  className="rounded-md bg-transparent"
                />
                <div className="mt-2 flex justify-end">
                  <Button type="submit" size="sm" disabled={sending || !draft.trim()}>
                    {sending ? "Sending…" : "Send"}
                  </Button>
                </div>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function StartList({
  starts,
  onOpen,
}: {
  starts: ChatInbox["starts"];
  onOpen: (body: Record<string, unknown>) => void;
}) {
  const hasStarts =
    starts.classes.length > 0 ||
    starts.withParents.length > 0 ||
    starts.withTeachers.length > 0 ||
    starts.withHeadmaster ||
    starts.parents.length > 0;

  if (!hasStarts) return null;

  return (
    <div className="border-t border-border px-4 py-3">
      <p className="text-[12px] font-medium text-muted-foreground">Start</p>
      <ul className="mt-2 space-y-1">
        {starts.classes.map((item) => (
          <li key={item.classId}>
            <StartButton
              title={item.name}
              detail={item.subjectName ?? "Class"}
              onClick={() => onOpen({ kind: "CLASS", classId: item.classId })}
            />
          </li>
        ))}
        {starts.withTeachers.map((item) => (
          <li key={`${item.teacherId}-${item.studentId}`}>
            <StartButton
              title={item.teacherName}
              detail={item.studentName}
              onClick={() =>
                onOpen({
                  kind: "TEACHER_PARENT",
                  teacherId: item.teacherId,
                  studentId: item.studentId,
                })
              }
            />
          </li>
        ))}
        {starts.withParents.map((item) => (
          <li key={`${item.parentId}-${item.studentId}`}>
            <StartButton
              title={item.parentName}
              detail={item.studentName}
              onClick={() =>
                onOpen({
                  kind: "TEACHER_PARENT",
                  parentId: item.parentId,
                  studentId: item.studentId,
                })
              }
            />
          </li>
        ))}
        {starts.withHeadmaster && (
          <li>
            <StartButton
              title="Headmaster"
              detail="School"
              onClick={() => onOpen({ kind: "HEADMASTER_PARENT" })}
            />
          </li>
        )}
        {starts.parents.map((item) => (
          <li key={item.parentId}>
            <StartButton
              title={item.parentName}
              detail={item.studentNames || "Parent"}
              onClick={() =>
                onOpen({ kind: "HEADMASTER_PARENT", parentId: item.parentId })
              }
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function StartButton({
  title,
  detail,
  onClick,
}: {
  title: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-md px-2 py-1.5 text-left hover:bg-muted/70"
    >
      <span className="block truncate text-[13px] font-medium text-ink">{title}</span>
      <span className="block truncate text-[12px] text-muted-foreground">{detail}</span>
    </button>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<PageLoading label="Loading messages…" />}>
      <MessagesScreen />
    </Suspense>
  );
}
