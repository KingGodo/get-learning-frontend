import { cn } from "@/lib/utils";

export type StatItem = {
  label: string;
  value: string | number;
};

type StatStripProps = {
  items: StatItem[];
  className?: string;
};

export function StatStrip({ items, className }: StatStripProps) {
  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        "grid gap-px overflow-hidden rounded-lg border border-border bg-border",
        items.length <= 3 ? "sm:grid-cols-3" : "grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="bg-card px-5 py-4">
          <p className="text-[11px] font-medium tracking-[0.04em] text-muted-foreground uppercase">
            {item.label}
          </p>
          <p className="mt-2 font-mono text-[1.5rem] leading-none font-semibold tracking-tight text-ink tabular-nums">
            {typeof item.value === "number"
              ? item.value.toLocaleString()
              : item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
