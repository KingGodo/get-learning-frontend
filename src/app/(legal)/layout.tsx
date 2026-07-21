import Link from "next/link";
import { SiteFooter } from "@/components/landing/site-footer";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
          <Link
            href="/"
            className="font-display text-[15px] font-semibold tracking-tight text-brand-dark"
          >
            Learning Hub
          </Link>
          <nav className="flex items-center gap-5 text-[13px]">
            <Link
              href="/privacy"
              className="font-medium text-zinc-500 hover:text-brand-dark"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="font-medium text-zinc-500 hover:text-brand-dark"
            >
              Terms
            </Link>
            <Link
              href="/login"
              className="font-semibold text-brand-dark hover:opacity-70"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 md:py-16">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
