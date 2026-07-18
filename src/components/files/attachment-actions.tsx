"use client";

import { useState } from "react";
import { Download, Eye, FileText, Loader2 } from "lucide-react";
import { ApiRequestError, filesApi } from "@/lib/api";
import { cn } from "@/lib/utils";

export function resolveFileUrl(
  pathOrUrl: string | null | undefined,
): string | null {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

  const apiBase = (
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1"
  ).replace(/\/api\/v1\/?$/, "");

  if (pathOrUrl.startsWith("/")) return `${apiBase}${pathOrUrl}`;
  return `${apiBase}/uploads/${pathOrUrl}`;
}

export function fileNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url, "http://localhost").pathname;
    return decodeURIComponent(pathname.split("/").pop() || "document");
  } catch {
    return "document";
  }
}

function isSupabaseUrl(url: string) {
  return /supabase\.co\/storage\//i.test(url);
}

async function getOpenableUrl(storedUrl: string): Promise<string> {
  const resolved = resolveFileUrl(storedUrl);
  if (!resolved) throw new Error("Missing file URL");

  if (!isSupabaseUrl(resolved)) return resolved;

  const { url } = await filesApi.signedUrl(resolved);
  return url;
}

type AttachmentActionsProps = {
  pathOrUrl: string;
  title?: string;
  className?: string;
  size?: "sm" | "md";
};

export function AttachmentActions({
  pathOrUrl,
  title = "Assignment file",
  className,
  size = "md",
}: AttachmentActionsProps) {
  const stored = resolveFileUrl(pathOrUrl);
  const [busy, setBusy] = useState<"preview" | "download" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!stored) return null;

  const filename = fileNameFromUrl(stored);
  const compact = size === "sm";

  async function onPreview() {
    setError(null);
    setBusy("preview");
    try {
      const url = await getOpenableUrl(pathOrUrl);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Could not open file. Check storage bucket settings.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function onDownload() {
    setError(null);
    setBusy("download");
    try {
      const url = await getOpenableUrl(pathOrUrl);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Could not download file. Check storage bucket settings.",
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 border border-zinc-200 bg-zinc-50/80",
          compact ? "px-3 py-2.5" : "px-4 py-3.5",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <span
            className={cn(
              "flex shrink-0 items-center justify-center bg-[#0C1A2E]/5 text-[#0C1A2E]",
              compact ? "size-8" : "size-10",
            )}
          >
            <FileText className={compact ? "size-3.5" : "size-4"} />
          </span>
          <div className="min-w-0">
            <p
              className={cn(
                "truncate font-medium text-[#0C1A2E]",
                compact ? "text-[12px]" : "text-[13px]",
              )}
            >
              {title}
            </p>
            <p className="truncate text-[11px] text-zinc-400">{filename}</p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void onPreview()}
            disabled={busy !== null}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 border border-zinc-200 bg-white font-semibold text-[#0C1A2E] transition-colors hover:border-[#0C1A2E]/30 hover:bg-zinc-50 disabled:opacity-60",
              compact ? "h-8 px-2.5 text-[12px]" : "h-9 px-3.5 text-[13px]",
            )}
          >
            {busy === "preview" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Eye className="size-3.5" />
            )}
            Preview
          </button>
          <button
            type="button"
            onClick={() => void onDownload()}
            disabled={busy !== null}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 bg-[#0C1A2E] font-semibold text-white transition-colors hover:bg-[#0C1A2E]/90 disabled:opacity-60",
              compact ? "h-8 px-2.5 text-[12px]" : "h-9 px-3.5 text-[13px]",
            )}
          >
            {busy === "download" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )}
            {busy === "download" ? "Downloading…" : "Download"}
          </button>
        </div>
      </div>
      {error && (
        <p className="text-[12px] leading-relaxed text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
