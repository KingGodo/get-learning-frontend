"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
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
    <section className="relative isolate min-h-svh overflow-hidden bg-[#0C1A2E]">
      <header className="relative z-20 border-b border-white/10">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="font-display text-[15px] font-semibold tracking-tight text-white transition-opacity hover:opacity-70"
          >
            Lumen
          </Link>
          <nav className="hidden items-center gap-7 text-sm sm:flex">
            <a
              href="#product"
              className="font-medium text-white/55 transition-colors hover:text-white"
            >
              Product
            </a>
            <a
              href="#how-it-works"
              className="font-medium text-white/55 transition-colors hover:text-white"
            >
              How it works
            </a>
            <Link
              href="/login"
              className="font-medium text-white/55 transition-colors hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="font-semibold text-white transition-opacity hover:opacity-70"
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
                    className="text-white hover:bg-white/10"
                    aria-label="Open menu"
                  />
                }
              >
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[min(100vw-2rem,20rem)] border-0 bg-[#0C1A2E] p-0 text-white"
              >
                <SheetHeader className="border-b border-white/10 px-5 py-4">
                  <SheetTitle className="font-display text-left text-white">
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
                                ? "rounded-md px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                                : "rounded-md px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
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
                            className="rounded-md px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
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
        {/* Solid copy plane — no glow overlay */}
        <div className="relative flex flex-col justify-center bg-[#0C1A2E] px-6 py-16 sm:px-10 lg:px-14 xl:px-16">
          <div className="relative max-w-lg">
            <motion.p
              className="font-display text-[clamp(3.25rem,8vw,5.5rem)] font-semibold leading-[0.92] tracking-[-0.04em] text-white"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease }}
            >
              Lumen
            </motion.p>

            <motion.h1
              className="mt-6 max-w-[18ch] text-[1.5rem] font-medium leading-[1.2] tracking-[-0.02em] text-white sm:text-[1.85rem]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease }}
            >
              The learning platform for classes that move fast.
            </motion.h1>

            <motion.p
              className="mt-5 max-w-md text-[15px] leading-relaxed text-white/60 sm:text-base"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease }}
            >
              Lumen is an LMS for teachers and students — create classes, assign
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
                className="inline-flex h-12 items-center justify-center bg-[#197de1] px-6 text-sm font-semibold text-white transition-[background-color,transform] hover:bg-[#1566b8] active:scale-[0.98]"
              >
                Start as a teacher
              </Link>
              <Link
                href="/register/student"
                className="inline-flex h-12 items-center justify-center border border-white/25 px-6 text-sm font-semibold text-white transition-colors hover:border-white/45 hover:bg-white/5"
              >
                Join as a student
              </Link>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="relative min-h-[38vh] lg:min-h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.15, ease }}
        >
          <Image
            src="/hero-classroom.jpg"
            alt="Students studying together at a chalkboard"
            fill
            priority
            unoptimized
            className="object-cover object-[center_25%]"
            sizes="(max-width: 1024px) 100vw, 55vw"
          />
        </motion.div>
      </div>
    </section>
  );
}
