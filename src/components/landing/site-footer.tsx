"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { APP_NAME } from "@/lib/brand";

const ease = [0.22, 1, 0.36, 1] as const;

const explore = [
  { href: "/#product", label: "Product" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/register", label: "Get access" },
  { href: "/login", label: "Sign in" },
];

const legal = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-hidden border-t border-border bg-white text-ink">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(37,99,235,0.08),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 top-10 hidden h-[22rem] w-[22rem] rounded-full bg-brand/10 blur-3xl md:block"
      />

      <div className="relative mx-auto max-w-6xl px-6 pb-10 pt-20 md:pb-12 md:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.75, ease }}
          className="flex flex-wrap items-center justify-between gap-6"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-3 transition-opacity hover:opacity-80"
            aria-label={APP_NAME}
          >
            <span className="relative inline-flex size-14 shrink-0 overflow-hidden rounded-xl bg-brand md:size-16">
              <Image
                src="/logo.png?v=7"
                alt=""
                width={64}
                height={64}
                unoptimized
                className="size-full object-contain mix-blend-screen"
              />
            </span>
            <span className="text-[13px] font-medium text-muted-foreground">
              Back to top
            </span>
          </Link>

          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/login" size="lg">
              Sign in
            </ButtonLink>
            <ButtonLink href="/register" variant="outline" size="lg">
              How to get access
            </ButtonLink>
          </div>
        </motion.div>

        <motion.h2
          className="mt-16 font-display text-[clamp(2.75rem,10vw,7.5rem)] font-semibold leading-[0.95] tracking-tight text-ink md:mt-20 whitespace-nowrap"
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.85, delay: 0.06, ease }}
        >
          Learning Hub
        </motion.h2>

        <motion.p
          className="mt-8 max-w-lg text-[16px] leading-relaxed text-muted-foreground md:mt-10 md:text-[17px]"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, delay: 0.12, ease }}
        >
          Clarity for every classroom — classes, assignments, and feedback
          without the noise.
        </motion.p>

        <motion.div
          className="mt-16 grid gap-10 border-t border-border pt-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr] lg:gap-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.16, ease }}
        >
          <div>
            <p className="text-[12px] font-medium tracking-wide text-muted-foreground">
              Explore
            </p>
            <ul className="mt-5 space-y-3">
              {explore.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-[15px] font-medium text-ink transition-colors hover:text-brand-dark"
                  >
                    {link.label}
                    <ArrowUpRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-dark" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[12px] font-medium tracking-wide text-muted-foreground">
              Legal
            </p>
            <ul className="mt-5 space-y-3">
              {legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[15px] font-medium text-ink/70 transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-[12px] font-medium tracking-wide text-muted-foreground">
              For schools
            </p>
            <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-ink/70">
              Accounts are created by your school admin. When you have
              credentials, sign in and start teaching or learning.
            </p>
          </div>
        </motion.div>

        <div className="mt-16 flex flex-col gap-4 border-t border-border pt-8 text-[12px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {APP_NAME}. Built for schools that value focus.
          </p>
          <p className="font-medium tracking-wide text-brand-dark/70">
            The classroom, clarified.
          </p>
        </div>
      </div>
    </footer>
  );
}
