import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";
import { Separator } from "@/components/ui/separator";
import { APP_NAME } from "@/lib/brand";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/#classes", label: "Classes" },
      { href: "/#assignments", label: "Assignments" },
      { href: "/#analytics", label: "Teacher analytics" },
      { href: "/#audit", label: "Audit log" },
      { href: "/#how-it-works", label: "How it works" },
    ],
  },
  {
    title: "Who signs in",
    links: [
      { href: "/#roles", label: "School admins" },
      { href: "/#roles", label: "Teachers" },
      { href: "/#roles", label: "Students" },
      { href: "/#roles", label: "Parents" },
      { href: "/#roles", label: "Headmasters" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/#faq", label: "Questions" },
      { href: "/#contact", label: "Contact" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)]">
          <div>
            <BrandMark href="/" size="sm" inverted />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-blue-100">
              {APP_NAME} is the workspace a school uses for classes,
              assignments, and grades. Accounts are created by the school, not
              by public signup.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <p className="text-sm font-semibold text-white">
                  {column.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="cursor-pointer text-sm text-blue-100 transition-colors duration-150 hover:text-white focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
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

        <Separator className="my-8 bg-white/25" />

        <div className="flex flex-col gap-2 text-sm text-blue-100 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {APP_NAME}
          </p>
          <p>Accounts are issued by your school.</p>
        </div>
      </div>
    </footer>
  );
}
