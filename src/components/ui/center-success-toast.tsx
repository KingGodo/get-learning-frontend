"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Centered success flash — not Sonner. Animates in/out, then closes. */
export function CenterSuccessToast({
  message,
  open,
  onClose,
  durationMs = 1800,
}: {
  message: string;
  open: boolean;
  onClose: () => void;
  durationMs?: number;
}) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      setLeaving(false);
      return;
    }

    setLeaving(false);
    setVisible(true);

    const leaveAt = window.setTimeout(() => setLeaving(true), durationMs);
    const closeAt = window.setTimeout(onClose, durationMs + 280);

    return () => {
      window.clearTimeout(leaveAt);
      window.clearTimeout(closeAt);
    };
  }, [open, onClose, durationMs]);

  if (!visible || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-0 z-[999999] flex items-center justify-center p-4"
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          "pointer-events-none flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-white px-5 py-3.5 shadow-[0_16px_40px_rgba(12,26,46,0.14)]",
          leaving ? "center-toast-out" : "center-toast-in",
        )}
      >
        <CheckCircle2
          className={cn(
            "size-5 shrink-0 text-emerald-600",
            !leaving && "center-toast-icon",
          )}
          strokeWidth={2}
        />
        <p className="text-[14px] font-semibold tracking-tight text-brand-dark">
          {message}
        </p>
      </div>
    </div>,
    document.body,
  );
}
