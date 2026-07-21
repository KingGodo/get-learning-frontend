"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import {
  LandingIllustration,
  landingIllustrations,
} from "@/components/landing/landing-illustration";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const ease = [0.22, 1, 0.36, 1] as const;

const navLinks = [
  { href: "#product", label: "Product" },
  { href: "#how-it-works", label: "How it works" },
  { href: "/login", label: "Sign in", isRoute: true },
  { href: "/register", label: "Get started", isRoute: true, primary: true },
] as const;

export function LandingHero() {
  return (
    <section className="relative isolate min-h-svh overflow-hidden bg-white">
      <header className="relative z-20 border-b border-zinc-200">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="font-display text-[15px] font-semibold tracking-tight text-brand-dark transition-opacity hover:opacity-70"
          >
            Learning Hub
          </Link>
          <nav className="hidden items-center gap-7 text-sm sm:flex">
            <a
              href="#product"
              className="font-medium text-zinc-500 transition-colors hover:text-brand-dark"
            >
              Product
            </a>
            <a
              href="#how-it-works"
              className="font-medium text-zinc-500 transition-colors hover:text-brand-dark"
            >
              How it works
            </a>
            <Link
              href="/login"
              className="font-medium text-zinc-500 transition-colors hover:text-brand-dark"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="font-semibold text-brand-dark transition-opacity hover:opacity-70"
            >
              Get started
            </Link>
          </nav>

          <div className="sm:hidden">
            <Sheet>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-brand-dark hover:bg-brand-light"
                    aria-label="Open menu"
                  />
                }
              >
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[min(100vw-2rem,20rem)] border border-zinc-200 bg-white p-0 text-brand-dark"
              >
                <SheetHeader className="border-b border-zinc-200 px-5 py-4">
                  <SheetTitle className="font-display text-left text-brand-dark">
                    Menu
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
                            className={
                              link.primary
                                ? "rounded-md px-3 py-2.5 text-sm font-semibold text-brand-dark transition-colors hover:bg-brand-light"
                                : "rounded-md px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-brand-light hover:text-brand-dark"
                            }
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
                            className="rounded-md px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-brand-light hover:text-brand-dark"
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

      <div className="relative z-10 grid min-h-[calc(100svh-3.5rem)] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="relative flex flex-col justify-center bg-white px-6 py-16 sm:px-10 lg:px-14 xl:px-16">
          <div className="relative max-w-lg">
            <motion.h1
              className="max-w-[18ch] text-[1.5rem] font-medium leading-[1.2] tracking-[-0.02em] text-brand-dark sm:text-[1.85rem]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease }}
            >
              The learning platform for classes that move fast.
            </motion.h1>

            <motion.p
              className="mt-5 max-w-md text-[15px] leading-relaxed text-zinc-600 sm:text-base"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease }}
            >
              Learning Hub is an LMS for teachers and students — create classes, assign
              work, collect submissions, and return feedback in one place.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-col gap-3 sm:flex-row"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease }}
            >
              <Link
                href="/register/teacher"
                className="inline-flex h-12 items-center justify-center bg-brand px-6 text-sm font-semibold text-brand-dark transition-[background-color,transform] hover:bg-brand-hover active:scale-[0.98]"
              >
                Start as a teacher
              </Link>
              <Link
                href="/register/student"
                className="inline-flex h-12 items-center justify-center border border-zinc-200 px-6 text-sm font-semibold text-brand-dark transition-colors hover:border-brand/40 hover:bg-brand-light"
              >
                Join as a student
              </Link>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="relative flex min-h-[38vh] items-center justify-center bg-white px-6 py-12 sm:px-10 lg:min-h-full lg:py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.15, ease }}
        >
          <LandingIllustration
            src={landingIllustrations.hero}
            alt="Online learning with Learning Hub"
            priority
            imageClassName="max-w-lg"
          />
        </motion.div>
      </div>
    </section>
  );
}
