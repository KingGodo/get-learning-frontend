import Link from "next/link";
import { SiteFooter } from "@/components/landing/site-footer";
import { APP_NAME } from "@/lib/brand";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-landing">
      <header className="border-b border-border bg-landing">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
          <Link
            href="/"
            className="font-display text-[15px] font-semibold tracking-tight text-brand-dark"
          >
            {APP_NAME}
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
