"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, X } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiRequestError, classesApi, materialsApi } from "@/lib/api";
import { toast, toastFromError } from "@/lib/toast";
import type { ClassRoom } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { Textarea } from "@/components/ui/textarea";

export default function AddClassMaterialsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const canUpload = user?.role === "TEACHER" || user?.role === "ADMIN";

  const [classRoom, setClassRoom] = useState<ClassRoom | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!canUpload) {
      router.replace(`/classes/${params.id}`);
      return;
    }
    classesApi
      .get(params.id)
      .then(setClassRoom)
      .catch((err) =>
        setError(err instanceof ApiRequestError ? err.message : "Not found"),
      );
  }, [params.id, canUpload, router]);

  function onFilesChange(list: FileList | null) {
    if (!list?.length) return;
    const next = Array.from(list);
    setFiles((prev) => {
      const merged = [...prev];
      for (const file of next) {
        if (
          !merged.some(
            (f) =>
              f.name === file.name &&
              f.size === file.size &&
              f.lastModified === file.lastModified,
          )
        ) {
          merged.push(file);
        }
      }
      return merged.slice(0, 20);
    });
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0) {
      toast.error("Select at least one PDF or Word file");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      if (description.trim()) fd.append("description", description.trim());
      for (const file of files) {
        fd.append("attachments", file);
      }
      const created = await materialsApi.create(params.id, fd);
      router.replace(`/classes/${params.id}#materials`);
      // Keep navigation snappy; list reloads on class page
      void created;
    } catch (err) {
      toastFromError(err, "Could not upload materials");
      setUploading(false);
    }
  }

  if (!canUpload) {
    return <PageLoading label="Redirecting…" />;
  }

  if (error && !classRoom) {
    return (
      <div className="space-y-4">
        <Link
          href={`/classes/${params.id}`}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-500 hover:text-brand-dark"
        >
          <ArrowLeft className="size-3.5" />
          Back to class
        </Link>
        <div
          className="border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
          role="alert"
        >
          {error}
        </div>
      </div>
    );
  }

  if (!classRoom) {
    return <PageLoading label="Loading class…" />;
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href={`/classes/${params.id}#materials`}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-500 transition-colors hover:text-brand-dark"
        >
          <ArrowLeft className="size-3.5" />
          Back to {classRoom.name}
        </Link>
        <PageHeader
          eyebrow="Reading materials"
          title="Add materials"
          description={`Select one or more PDF or Word documents for ${classRoom.name}. Each file becomes its own material (title from the filename).`}
          className="mt-4 pb-0"
        />
      </div>

      <form onSubmit={(e) => void onSubmit(e)} className="relative space-y-5">
        {uploading && <PageLoading overlay label="Uploading materials…" />}

        <div className="space-y-1.5">
          <Label htmlFor="attachments" className="text-[13px] text-zinc-600">
            Documents
          </Label>
          <Input
            id="attachments"
            type="file"
            accept=".pdf,.doc,.docx"
            multiple
            onChange={(e) => {
              onFilesChange(e.target.files);
              e.target.value = "";
            }}
            className="h-10 rounded-md"
          />
          <p className="text-[12px] text-zinc-400">
            You can select multiple files at once (up to 20). PDF or Word only,
            10 MB each.
          </p>
        </div>

        {files.length > 0 && (
          <ul className="divide-y divide-border border-y border-border">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${file.size}-${file.lastModified}`}
                className="flex items-center gap-3 py-2.5"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-brand-dark">
                  <FileText className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-brand-dark">
                    {file.name}
                  </p>
                  <p className="text-[11px] tabular-nums text-zinc-400">
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="flex size-8 items-center justify-center text-zinc-400 hover:text-red-600"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-[13px] text-zinc-600">
            Shared note (optional)
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="rounded-md"
            placeholder="Shown on every file in this upload, e.g. Read before Friday’s class"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" size="sm" disabled={uploading || files.length === 0}>
            {uploading
              ? "Uploading…"
              : `Upload ${files.length || ""} material${files.length === 1 ? "" : "s"}`.trim()}
          </Button>
          <ButtonLink
            href={`/classes/${params.id}#materials`}
            variant="outline"
            size="sm"
          >
            Cancel
          </ButtonLink>
        </div>
      </form>
    </div>
  );
}
