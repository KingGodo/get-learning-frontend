import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100svh] flex-col bg-page">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
          <BrandMark href="/" size="sm" />
          <Link
            href="/"
            className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-ink"
          >
            Back to home
          </Link>
        </div>
      </header>

      <div className="relative flex flex-1 items-start justify-center overflow-y-auto px-6 py-12 sm:items-center sm:py-16">
        {children}
      </div>
    </div>
  );
}
