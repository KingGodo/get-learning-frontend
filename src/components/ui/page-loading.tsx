"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type PageLoadingProps = {
  label?: string;
  /** Full-screen overlay (forms / mutations). Default: inline page filler. */
  overlay?: boolean;
  className?: string;
};

export function PageLoading({
  label = "Loading…",
  overlay = false,
  className,
}: PageLoadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6",
        overlay
          ? "fixed inset-0 z-50 bg-white/80 backdrop-blur-md"
          : "min-h-[42vh] w-full py-16",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      {/* Orbiting spark on a quiet ring */}
      <div className="relative size-10" aria-hidden>
        <span className="absolute inset-0 rounded-full border border-[#0C1A2E]/12" />
        <motion.span
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.15, repeat: Infinity, ease: "linear" }}
        >
          <span className="absolute top-0 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0C1A2E]" />
        </motion.span>
        <motion.span
          className="absolute inset-[7px] rounded-full bg-[#0C1A2E]/10"
          animate={{ scale: [0.85, 1.05, 0.85], opacity: [0.35, 0.7, 0.35] }}
          transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <p className="text-[13px] font-medium tracking-[-0.01em] text-zinc-400">
        {label}
      </p>
    </div>
  );
}
