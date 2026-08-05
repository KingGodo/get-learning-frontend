import { cn } from "@/lib/utils";

const tones = {
  neutral: "bg-muted text-muted-foreground",
  brand: "bg-brand-light text-brand",
  success: "bg-brand-light text-brand",
  warning: "bg-muted text-foreground",
  danger: "bg-red-50 text-red-700",
} as const;

type StatusBadgeProps = {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
};

export function StatusBadge({
  children,
  tone = "neutral",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function statusToneFor(status: string): keyof typeof tones {
  const value = status.toUpperCase();
  if (value === "ACTIVE" || value === "GRADED" || value === "PUBLISHED") {
    return "success";
  }
  if (value === "SUBMITTED" || value === "DRAFT") return "brand";
  if (value === "LATE" || value === "SUSPENDED") return "danger";
  if (value === "INACTIVE" || value === "CLOSED" || value === "ARCHIVED") {
    return "neutral";
  }
  return "neutral";
}
