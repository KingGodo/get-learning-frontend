"use client";

import { useEffect, useState } from "react";
import { FileText, Trash2 } from "lucide-react";
import {
  AttachmentActions,
  resolveFileUrl,
} from "@/components/files/attachment-actions";
import { filesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function isSupabaseUrl(url: string) {
  return /supabase\.co\/storage\//i.test(url);
}

function fileKind(pathOrUrl: string): "pdf" | "word" | "other" {
  const lower = pathOrUrl.toLowerCase();
  if (lower.includes(".pdf") || lower.endsWith("pdf")) return "pdf";
  if (/\.docx?(\?|$)/i.test(lower) || lower.includes(".doc")) return "word";
  return "other";
}

type MaterialPreviewCardProps = {
  title: string;
  description?: string | null;
  attachment: string;
  meta?: string;
  canRemove?: boolean;
  onRemove?: () => void;
  className?: string;
};

export function MaterialPreviewCard({
  title,
  description,
  attachment,
  meta,
  canRemove,
  onRemove,
  className,
}: MaterialPreviewCardProps) {
  const kind = fileKind(attachment);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    setPreviewUrl(null);

    async function load() {
      const resolved = resolveFileUrl(attachment);
      if (!resolved) {
        if (!cancelled) setFailed(true);
        return;
      }
      try {
        if (isSupabaseUrl(resolved)) {
          const { url } = await filesApi.signedUrl(resolved, "preview");
          if (!cancelled) setPreviewUrl(url);
        } else if (!cancelled) {
          setPreviewUrl(resolved);
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [attachment]);

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm",
        className,
      )}
    >
      <div className="relative h-44 overflow-hidden bg-zinc-100 sm:h-48">
        {kind === "pdf" && previewUrl && !failed ? (
          <iframe
            title={`Preview of ${title}`}
            src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
            className="pointer-events-none absolute inset-x-0 top-0 h-[180%] w-full origin-top scale-[1.01] border-0 bg-white"
            loading="lazy"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="flex h-full w-[72%] max-w-[11rem] flex-col overflow-hidden rounded-sm border border-zinc-200 bg-white shadow-md">
              <div
                className={cn(
                  "flex h-8 items-center gap-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-wide text-white",
                  kind === "word" ? "bg-[#2b579a]" : "bg-zinc-500",
                )}
              >
                <FileText className="size-3" />
                {kind === "word" ? "Word" : kind === "pdf" ? "PDF" : "File"}
              </div>
              <div className="flex flex-1 flex-col gap-1.5 bg-[linear-gradient(to_bottom,#fff_0%,#fafafa_100%)] p-3">
                <div className="h-1.5 w-[88%] rounded-full bg-zinc-200" />
                <div className="h-1.5 w-full rounded-full bg-zinc-100" />
                <div className="h-1.5 w-[92%] rounded-full bg-zinc-100" />
                <div className="h-1.5 w-[70%] rounded-full bg-zinc-100" />
                <div className="mt-1 h-1.5 w-full rounded-full bg-zinc-100" />
                <div className="h-1.5 w-[84%] rounded-full bg-zinc-100" />
              </div>
            </div>
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/90 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col gap-3 border-t border-border px-3.5 py-3">
        <div className="min-w-0">
          <p className="line-clamp-2 text-[13px] font-semibold text-brand-dark">
            {title}
          </p>
          {description ? (
            <p className="mt-0.5 line-clamp-2 text-[12px] text-zinc-500">
              {description}
            </p>
          ) : null}
          {meta ? (
            <p className="mt-1 text-[11px] text-zinc-400">{meta}</p>
          ) : null}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-1.5">
          <AttachmentActions
            pathOrUrl={attachment}
            title={title}
            size="sm"
            variant="buttons"
          />
          {canRemove && onRemove ? (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={onRemove}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              aria-label={`Remove ${title}`}
            >
              <Trash2 className="size-3.5" />
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
