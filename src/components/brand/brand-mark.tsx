import Link from "next/link";
import { APP_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  href?: string | null;
  size?: "sm" | "md" | "lg" | "hero";
};

const sizes = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
  hero: "text-4xl md:text-5xl",
};

export function BrandMark({ className, href, size = "md" }: BrandMarkProps) {
  const word = (
    <span
      className={cn(
        "font-semibold tracking-tight text-foreground",
        sizes[size],
        className,
      )}
    >
      {APP_NAME}
    </span>
  );

  if (href === null) return word;
  return (
    <Link href={href ?? "/"} className="hover:opacity-70">
      {word}
    </Link>
  );
}
