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
          className="font-display text-[15px] font-semibold tracking-tight text-black transition-opacity hover:opacity-70"
        >
          Lumen
        </Link>
        <Link
          href="/"
          className="text-sm text-zinc-500 transition-colors hover:text-black"
        >
          Back to home
        </Link>
      </header>

      <div className="relative flex flex-1 items-center justify-center px-6 pb-16">
        {children}
      </div>
    </div>
  );
}
