"use client";

import { useState } from "react";
import { Download, Eye, FileText, Loader2 } from "lucide-react";
import { filesApi, getApiOrigin } from "@/lib/api";
import { toastFromError } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function resolveFileUrl(
  pathOrUrl: string | null | undefined,
): string | null {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

  const apiBase = getApiOrigin();

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

async function getOpenableUrl(
  storedUrl: string,
  mode: "preview" | "download" = "preview",
): Promise<string> {
  const resolved = resolveFileUrl(storedUrl);
  if (!resolved) throw new Error("Missing file URL");

  if (!isSupabaseUrl(resolved)) return resolved;

  const { url } = await filesApi.signedUrl(resolved, mode);
  return url;
}

type AttachmentActionsProps = {
  pathOrUrl: string;
  title?: string;
  className?: string;
  size?: "sm" | "md";
  /** `card` shows file meta; `buttons` is preview/download only (no repeated labels). */
  variant?: "card" | "buttons";
};

export function AttachmentActions({
  pathOrUrl,
  title = "Assignment file",
  className,
  size = "md",
  variant = "card",
}: AttachmentActionsProps) {
  const stored = resolveFileUrl(pathOrUrl);
  const [busy, setBusy] = useState<"preview" | "download" | null>(null);

  if (!stored) return null;

  const filename = fileNameFromUrl(stored);
  const compact = size === "sm";
  const downloadName = title.includes(".")
    ? title
    : (() => {
        const ext = filename.includes(".")
          ? filename.slice(filename.lastIndexOf("."))
          : "";
        return `${title}${ext}`;
      })();

  async function onPreview() {
    setBusy("preview");
    try {
      const url = await getOpenableUrl(pathOrUrl, "preview");
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Preview failed (${res.status})`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const win = window.open(objectUrl, "_blank", "noopener,noreferrer");
      if (!win) {
        URL.revokeObjectURL(objectUrl);
        throw new Error("Popup blocked");
      }
      // Give the new tab time to load the blob before revoking.
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (err) {
      toastFromError(err, "Could not open file. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function onDownload() {
    setBusy("download");
    try {
      const url = await getOpenableUrl(pathOrUrl, "download");
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Download failed (${res.status})`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      toastFromError(
        err,
        "Could not download file. Check storage bucket settings.",
      );
    } finally {
      setBusy(null);
    }
  }

  const buttons = (
    <div className="flex shrink-0 flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        size={compact ? "xs" : "sm"}
        onClick={() => void onPreview()}
        disabled={busy !== null}
      >
        {busy === "preview" ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Eye className="size-3.5" />
        )}
        Preview
      </Button>
      <Button
        type="button"
        size={compact ? "xs" : "sm"}
        onClick={() => void onDownload()}
        disabled={busy !== null}
      >
        {busy === "download" ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Download className="size-3.5" />
        )}
        {busy === "download" ? "Downloading…" : "Download"}
      </Button>
    </div>
  );

  if (variant === "buttons") {
    return <div className={cn(className)}>{buttons}</div>;
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
              "flex shrink-0 items-center justify-center bg-brand-dark/5 text-brand-dark",
              compact ? "size-8" : "size-10",
            )}
          >
            <FileText className={compact ? "size-3.5" : "size-4"} />
          </span>
          <div className="min-w-0">
            <p
              className={cn(
                "truncate font-medium text-brand-dark",
                compact ? "text-[12px]" : "text-[13px]",
              )}
            >
              {title}
            </p>
          </div>
        </div>

        {buttons}
      </div>
    </div>
  );
}
