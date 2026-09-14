import { cn } from "@/lib/utils";

export function FieldError({
  message,
  className,
}: {
  message?: string | null;
  className?: string;
}) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className={cn("text-[12px] text-red-600", className)}
    >
      {message}
    </p>
  );
}
