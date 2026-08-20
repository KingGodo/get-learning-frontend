"use client";

import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";

export type SchoolSetupCounts = {
  subjects: number;
  classes: number;
  teachers: number;
};

export function SchoolOrderCard({
  action,
  className,
}: {
  action?: ReactNode;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3.5",
        className,
      )}
    >
      <p className="max-w-xl text-[13px] leading-relaxed text-muted-foreground">
        <span className="font-medium text-ink">Add in this order:</span>{" "}
        subjects, then classes, then teachers. A class belongs to a subject.
        Students can be added anytime.
      </p>
      {action}
    </aside>
  );
}

export function SetupRequired({
  reason,
  href,
  action,
}: {
  reason: string;
  href: string;
  action: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-5">
      <p className="text-[13px] leading-relaxed text-muted-foreground">
        {reason}
      </p>
      <ButtonLink href={href} size="sm" className="mt-4">
        {action}
      </ButtonLink>
    </div>
  );
}

