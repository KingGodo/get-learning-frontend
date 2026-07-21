import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100svh] flex-col bg-white">
      <header className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-display text-[15px] font-semibold tracking-tight text-brand-dark transition-opacity hover:opacity-70"
        >
          Learning Hub
        </Link>
        <Link
          href="/"
          className="text-sm text-zinc-500 transition-colors hover:text-brand-dark"
        >
          Back to home
        </Link>
      </header>

      <div className="relative flex flex-1 items-start justify-center overflow-y-auto px-6 pb-16 pt-4 sm:items-center sm:pt-0">
        {children}
      </div>
    </div>
  );
}
