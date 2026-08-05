"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { BrandMark } from "@/components/brand/brand-mark";
import {
  LandingIllustration,
  landingIllustrations,
} from "@/components/landing/landing-illustration";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const ease = [0.22, 1, 0.36, 1] as const;

const navLinks: Array<{
  href: string;
  label: string;
  isRoute?: boolean;
}> = [
  { href: "#product", label: "Product" },
  { href: "#how-it-works", label: "How it works" },
  { href: "/login", label: "Sign in", isRoute: true },
  { href: "/register", label: "Get access", isRoute: true },
];

export function LandingHero() {
  return (
    <section className="relative isolate min-h-svh overflow-hidden bg-white">
      <header className="relative z-20 border-b border-border/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <BrandMark href="/" size="sm" display />
          <nav className="hidden items-center gap-8 text-sm sm:flex">
            <a
              href="#product"
              className="font-medium text-ink/55 transition-colors hover:text-ink"
            >
              Product
            </a>
            <a
              href="#how-it-works"
              className="font-medium text-ink/55 transition-colors hover:text-ink"
            >
              How it works
            </a>
            <Link
              href="/login"
              className="font-medium text-ink/55 transition-colors hover:text-ink"
            >
              Sign in
            </Link>
            <ButtonLink href="/register" size="sm">
              Get access
            </ButtonLink>
          </nav>

          <div className="sm:hidden">
            <Sheet>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-ink hover:bg-page"
                    aria-label="Open menu"
                  />
                }
              >
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[min(100vw-2rem,20rem)] border-border bg-white p-0 text-ink"
              >
                <SheetHeader className="border-b border-border px-5 py-4">
                  <SheetTitle className="text-left">
                    <BrandMark href={null} size="sm" display />
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 px-3 py-4">
                  {navLinks.map((link) =>
                    link.isRoute ? (
                      <SheetClose
                        key={link.href}
                        nativeButton={false}
                        render={
                          <Link
                            href={link.href}
                            className="rounded-md px-3 py-2.5 text-sm font-medium text-ink/70 transition-colors hover:bg-page hover:text-ink"
                          />
                        }
                      >
                        {link.label}
                      </SheetClose>
                    ) : (
                      <SheetClose
                        key={link.href}
                        nativeButton={false}
                        render={
                          <a
                            href={link.href}
                            className="rounded-md px-3 py-2.5 text-sm font-medium text-ink/70 transition-colors hover:bg-page hover:text-ink"
                          />
                        }
                      >
                        {link.label}
                      </SheetClose>
                    ),
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="relative z-10 grid min-h-[calc(100svh-4rem)] lg:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-16 sm:px-10 lg:px-14 xl:px-16">
          <div className="mx-auto w-full max-w-xl lg:mx-0">
            <motion.h1
              className="font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight text-ink sm:text-[3.4rem] md:text-[3.85rem]"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease }}
            >
              The classroom,
              <br />
              clarified.
            </motion.h1>

            <motion.p
              className="mt-6 max-w-lg text-[16px] leading-relaxed text-ink/60"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.08, ease }}
            >
              Learning Hub brings classes, assignments, submissions, and feedback
              into one calm workspace — so teachers can teach and students stay
              on track. Your school admin creates accounts and shares the login
              credentials you need to get started.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.16, ease }}
            >
              <ButtonLink href="/login" size="lg">
                Sign in
              </ButtonLink>
              <ButtonLink href="/register" variant="outline" size="lg">
                How to get access
              </ButtonLink>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="relative flex min-h-[40vh] items-center justify-center bg-page px-6 py-12 sm:px-10 lg:min-h-full lg:py-16"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.12, ease }}
        >
          <LandingIllustration
            src={landingIllustrations.hero}
            alt="Teachers and students working in Learning Hub"
            priority
            className="w-full"
            imageClassName="max-w-lg illustration-quiet"
          />
        </motion.div>
      </div>
    </section>
  );
}
