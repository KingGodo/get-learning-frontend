"use client";

import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";
import { APP_NAME } from "@/lib/brand";

const explore = [
  { href: "/#product", label: "Product" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#roles", label: "Who it’s for" },
  { href: "/#faq", label: "FAQ" },
];

const account = [
  { href: "/login", label: "Sign in" },
  { href: "/register", label: "Get access" },
];

const legal = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-landing">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <BrandMark href="/" size="sm" />
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-ink/55">
              Classes, assignments, and feedback — the school day, in one
              workspace.
            </p>
          </div>
          <FooterCol title="Explore" links={explore} />
          <FooterCol title="Account" links={account} />
          <FooterCol title="Legal" links={legal} />
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-[12px] text-ink/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {APP_NAME}
          </p>
          <p>Accounts are issued by your school.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div>
      <p className="text-[12px] font-medium tracking-[0.12em] text-brand uppercase">
        {title}
      </p>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-[14px] font-medium text-ink/70 transition-colors duration-150 ease-craft hover:text-brand-dark"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
