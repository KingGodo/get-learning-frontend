import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col items-start gap-4 border-b border-border pb-6 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={cn(
            "font-semibold tracking-tight text-ink",
            eyebrow
              ? "mt-1.5 text-[1.5rem] leading-tight sm:text-[1.75rem]"
              : "text-[1.5rem] leading-tight sm:text-[1.75rem]",
          )}
        >
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
