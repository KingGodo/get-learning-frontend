import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

/** Always serve the file from /public (bypass optimizer cache). */
const LOGO_SRC = "/logo.png?v=7";

type BrandMarkProps = {
  className?: string;
  href?: string | null;
  size?: "sm" | "md" | "lg" | "hero";
  /** Show the wordmark text next to the mark. */
  showWordmark?: boolean;
  /** Use display font (landing / marketing). */
  display?: boolean;
  /** White wordmark for dark/blue backgrounds. */
  inverted?: boolean;
};

const markBox = {
  sm: "size-11",
  md: "size-12",
  lg: "size-14",
  hero: "size-20 md:size-24",
};

const markPx = {
  sm: 44,
  md: 48,
  lg: 56,
  hero: 96,
};

const wordSizes = {
  sm: "text-[15px]",
  md: "text-lg",
  lg: "text-xl",
  hero: "text-3xl md:text-5xl",
};

export function BrandMark({
  className,
  href,
  size = "md",
  showWordmark = true,
  display = false,
  inverted = false,
}: BrandMarkProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative inline-flex shrink-0 overflow-hidden rounded-xl bg-brand",
          markBox[size],
        )}
      >
        <Image
          src={LOGO_SRC}
          alt=""
          width={markPx[size]}
          height={markPx[size]}
          unoptimized
          priority
          className="size-full object-contain mix-blend-screen"
        />
      </span>
      {showWordmark && (
        <span
          className={cn(
            "font-semibold tracking-tight",
            inverted ? "text-white" : "text-foreground",
            display ? "font-display" : "font-sans",
            wordSizes[size],
          )}
        >
          {APP_NAME}
        </span>
      )}
    </span>
  );

  if (href === null) return content;
  return (
    <Link
      href={href ?? "/"}
      className="inline-flex transition-opacity hover:opacity-80"
      aria-label={APP_NAME}
    >
      {content}
    </Link>
  );
}
