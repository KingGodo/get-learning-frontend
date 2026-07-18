import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

export function AppleButton({
  href,
  children,
  variant = "primary",
  className,
}: Props) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold transition-colors",
        variant === "primary" && "bg-blue text-white hover:bg-blue/90",
        variant === "secondary" &&
          "border border-zinc-300 bg-white text-black hover:bg-zinc-50",
        variant === "ghost" && "text-blue hover:underline",
        className,
      )}
    >
      {children}
    </Link>
  );
}
