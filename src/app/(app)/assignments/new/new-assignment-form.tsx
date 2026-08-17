"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { assignmentsApi, classesApi } from "@/lib/api";
import { toast, toastFromError } from "@/lib/toast";
import type { ClassRoom } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { Textarea } from "@/components/ui/textarea";

export default function NewAssignmentForm() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetClassId = searchParams.get("classId") ?? "";
  const canManage = user?.role === "TEACHER" || user?.role === "ADMIN";

  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [classId, setClassId] = useState(presetClassId);
  const [allowLate, setAllowLate] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    instructions: "",
    dueDate: "",
    totalMarks: "100",
    status: "PUBLISHED",
  });

  useEffect(() => {
    if (!user) return;
    if (!canManage) {
      router.replace("/assignments");
      return;
    }

    classesApi
      .list()
      .then((data) => {
        setClasses(data);
        if (!presetClassId && data.length === 1) {
          setClassId(data[0].id);
        }
      })
      .catch((err) =>
        toastFromError(err, "Could not load classes"),
      )
      .finally(() => setLoading(false));
  }, [user, canManage, router, presetClassId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!classId) {
      toast.error("Select a class");
      return;
    }
    if (!form.dueDate) {
      toast.error("Choose a due date");
      return;
    }

    const due = new Date(form.dueDate);
    if (Number.isNaN(due.getTime())) {
      toast.error("Due date is invalid");
      return;
    }

    setPending(true);
    try {
      const fd = new FormData();
      fd.append("classId", classId);
      fd.append("title", form.title.trim());
      fd.append("description", form.description.trim());
      if (form.instructions.trim()) {
        fd.append("instructions", form.instructions.trim());
      }
      fd.append("dueDate", due.toISOString());
      fd.append("totalMarks", form.totalMarks);
      fd.append("allowLateSubmission", allowLate ? "true" : "false");
      fd.append("status", form.status);
      if (file) fd.append("attachment", file);

      const created = await assignmentsApi.create(fd);
      router.replace(`/assignments/${created.id}`);
    } catch (err) {
      toastFromError(err, "Could not create assignment");
      setPending(false);
    }
  }

  if (!user || loading) {
    return <PageLoading label="Loading…" />;
  }

  return (
    <div className="relative mx-auto max-w-xl space-y-8">
      {pending && <PageLoading overlay label="Publishing assignment…" />}

      <div>
        <Link
          href="/assignments"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-3.5" />
          Back to assignments
        </Link>
        <PageHeader
          title="New assignment"
          description="Publish work for a class with a due date, marks, and an optional PDF or Word attachment."
          className="mt-4 pb-0"
        />
      </div>

      {classes.length === 0 ? (
        <div className="space-y-4 border-y border-border py-8">
          <p className="text-sm text-muted-foreground">
            You need an allocated class before you can create an assignment. Ask
            your school admin to assign subjects and classes to your account.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="classId" className="text-[13px] text-muted-foreground">
              Class
            </Label>
            <select
              id="classId"
              required
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand-dark/20"
            >
              <option value="" disabled>
                Choose class
              </option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.subject?.name ? ` · ${c.subject.name}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-[13px] text-muted-foreground">
              Title
            </Label>
            <Input
              id="title"
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="h-9 rounded-md"
              placeholder="Essay 1"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="description"
              className="text-[13px] text-muted-foreground"
            >
              Description
            </Label>
            <Textarea
              id="description"
              required
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className="min-h-24 rounded-md"
              placeholder="What students need to do"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="instructions"
              className="text-[13px] text-muted-foreground"
            >
              Instructions (optional)
            </Label>
            <Textarea
              id="instructions"
              value={form.instructions}
              onChange={(e) =>
                setForm((f) => ({ ...f, instructions: e.target.value }))
              }
              className="min-h-20 rounded-md"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="due" className="text-[13px] text-muted-foreground">
                Due date
              </Label>
              <Input
                id="due"
                type="datetime-local"
                required
                value={form.dueDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dueDate: e.target.value }))
                }
                className="h-9 rounded-md"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="marks"
                className="text-[13px] text-muted-foreground"
              >
                Total marks
              </Label>
              <Input
                id="marks"
                type="number"
                min={1}
                required
                value={form.totalMarks}
                onChange={(e) =>
                  setForm((f) => ({ ...f, totalMarks: e.target.value }))
                }
                className="h-9 rounded-md"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="status" className="text-[13px] text-muted-foreground">
              Status
            </Label>
            <select
              id="status"
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value }))
              }
              className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand-dark/20"
            >
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="late"
              checked={allowLate}
              onCheckedChange={(v) => setAllowLate(v === true)}
            />
            <Label htmlFor="late" className="text-[13px] text-muted-foreground">
              Allow late submission
            </Label>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="file" className="text-[13px] text-muted-foreground">
              Attachment (optional)
            </Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="h-9 rounded-md"
            />
            <p className="text-[12px] text-muted-foreground">
              PDF or Word only (.pdf, .doc, .docx). Leave empty if you don’t need
              a file.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" disabled={pending}>
              {pending
                ? "Publishing…"
                : form.status === "DRAFT"
                  ? "Save draft"
                  : "Publish assignment"}
            </Button>
            <ButtonLink href="/assignments" variant="outline">
              Cancel
            </ButtonLink>
          </div>
        </form>
      )}
    </div>
  );
}
