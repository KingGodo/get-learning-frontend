import Link from "next/link";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/#product", label: "Features" },
      { href: "/#how-it-works", label: "How it works" },
    ],
  },
  {
    title: "Get started",
    links: [
      { href: "/register/teacher", label: "Teacher signup" },
      { href: "/register/student", label: "Student signup" },
      { href: "/login", label: "Sign in" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms & Conditions" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white text-brand-dark">
      <div className="border-t border-zinc-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-md">
            <p className="font-display text-2xl font-semibold tracking-tight">
              Ready when you are.
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-zinc-500">
              Join Learning Hub and run your next class from one clear workspace.
            </p>
          </div>
          <Link
            href="/register"
            className="inline-flex h-11 shrink-0 items-center justify-center bg-brand-dark px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Get started
          </Link>
        </div>
      </div>

      <div className="border-t border-zinc-200">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-14 md:grid-cols-[1.3fr_repeat(3,minmax(0,1fr))] md:gap-10">
          <div>
            <Link
              href="/"
              className="font-display text-[18px] font-semibold tracking-tight"
            >
              Learning Hub
            </Link>
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-zinc-500">
              Learning management for teachers and students — classes,
              assignments, submissions, and feedback.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                {col.title}
              </p>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-zinc-600 transition-colors hover:text-brand-dark"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-zinc-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-[12px] text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Learning Hub. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/privacy" className="hover:text-brand-dark">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-brand-dark">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
