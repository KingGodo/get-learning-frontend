"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  LandingIllustration,
  landingIllustrations,
} from "@/components/landing/landing-illustration";
import { ButtonLink } from "@/components/ui/button-link";

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.35 },
  transition: { duration: 0.7, ease },
};

const capabilities = [
  {
    number: "01",
    title: "Classes & codes",
    body: "Open a class, share a code, and students enroll in seconds.",
  },
  {
    number: "02",
    title: "Assignments & files",
    body: "Publish work with due dates and attachments. Students submit in one flow.",
  },
  {
    number: "03",
    title: "Grading & feedback",
    body: "See what’s waiting, score submissions, and reply without leaving the page.",
  },
];

const steps = [
  {
    step: "01",
    title: "Get your account",
    body: "Your school admin creates accounts and shares login credentials.",
  },
  {
    step: "02",
    title: "Set up the workspace",
    body: "Teachers add subjects and classes. Students join and see what’s due.",
  },
  {
    step: "03",
    title: "Teach and learn",
    body: "Assign work, collect submissions, grade, and stay aligned.",
  },
];

const roles = [
  {
    title: "Built for teachers",
    body: "Subjects, classes, assignments, submissions, and notifications — structured so you spend time teaching, not hunting for work.",
    illustration: landingIllustrations.teacher,
    alt: "Teacher managing class assignments in Learning Hub",
    href: "/register",
    cta: "How teachers get access",
  },
  {
    title: "Built for students",
    body: "Join a class, track deadlines, submit files, and see grades and feedback in one clear view.",
    illustration: landingIllustrations.student,
    alt: "Student reading and learning in Learning Hub",
    href: "/register",
    cta: "How students get access",
  },
];

export function LandingPillars() {
  return (
    <>
      <section
        id="product"
        className="scroll-mt-16 border-t border-border bg-white px-6 py-28 md:py-36"
      >
        <div className="mx-auto max-w-6xl">
          <motion.div {...fadeUp} className="max-w-2xl">
            <p className="text-[13px] font-medium tracking-wide text-brand-dark/70">
              The product
            </p>
            <h2 className="mt-5 font-display text-[2.4rem] font-semibold leading-[1.08] tracking-tight text-ink md:text-[3.1rem]">
              One LMS.
              <span className="mt-2 block text-ink/35">The essentials only.</span>
            </h2>
            <p className="mt-6 max-w-md text-[16px] leading-relaxed text-muted-foreground">
              Learning Hub keeps the workflow that matters — without burying you
              in unused modules.
            </p>
          </motion.div>

          <ul className="mt-20 divide-y divide-border border-y border-border">
            {capabilities.map((item, index) => (
              <motion.li
                key={item.number}
                className="grid gap-5 py-10 sm:grid-cols-[5.5rem_minmax(0,1fr)_minmax(0,1.1fr)] sm:gap-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.65, delay: index * 0.08, ease }}
              >
                <span className="font-mono text-[13px] font-medium text-brand">
                  {item.number}
                </span>
                <h3 className="font-display text-2xl font-semibold tracking-tight text-ink">
                  {item.title}
                </h3>
                <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground sm:pt-1.5">
                  {item.body}
                </p>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-16 relative overflow-hidden border-t border-border bg-page px-6 py-28 md:py-36"
      >
        <div className="relative mx-auto max-w-6xl">
          <motion.div {...fadeUp} className="max-w-xl">
            <p className="text-[13px] font-medium tracking-wide text-brand-dark/70">
              How it works
            </p>
            <h2 className="mt-5 font-display text-[2.4rem] font-semibold leading-[1.08] tracking-tight text-ink md:text-[3.1rem]">
              Three steps to a clearer school day.
            </h2>
          </motion.div>

          <ol className="mt-20 grid gap-12 md:grid-cols-3 md:gap-8">
            {steps.map((item, index) => (
              <motion.li
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.7, delay: index * 0.1, ease }}
              >
                <p className="font-display text-6xl font-semibold tracking-tight text-brand/35 md:text-7xl">
                  {item.step}
                </p>
                <h3 className="mt-8 text-lg font-semibold text-ink">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-border bg-white px-6 py-28 md:py-36">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fadeUp} className="max-w-xl">
            <p className="text-[13px] font-medium tracking-wide text-brand-dark/70">
              Who it&apos;s for
            </p>
            <h2 className="mt-5 font-display text-[2.4rem] font-semibold leading-[1.08] tracking-tight text-ink md:text-[3.1rem]">
              Two roles. One shared workspace.
            </h2>
          </motion.div>

          <div className="mt-20 grid gap-12 lg:grid-cols-2 lg:gap-14">
            {roles.map((role, index) => (
              <motion.article
                key={role.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: index * 0.1, ease }}
              >
                <LandingIllustration
                  src={role.illustration}
                  alt={role.alt}
                  className="aspect-[5/4] bg-page px-6 py-8"
                  imageClassName="max-w-sm illustration-quiet"
                />
                <h3 className="mt-8 font-display text-2xl font-semibold tracking-tight text-ink">
                  {role.title}
                </h3>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                  {role.body}
                </p>
                <Link
                  href={role.href}
                  className="mt-5 inline-flex text-sm font-medium text-ink underline-offset-4 hover:underline"
                >
                  {role.cta}
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-ink">
        <div className="grid lg:grid-cols-2">
          <div className="flex flex-col justify-center px-6 py-20 sm:px-12 lg:px-16 lg:py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease }}
            >
              <h2 className="font-display text-[2.4rem] font-semibold leading-[1.08] tracking-tight text-white md:text-[3.2rem]">
                Ask for an account.
                <span className="mt-2 block text-brand">Then get to work.</span>
              </h2>
              <p className="mt-6 max-w-md text-[16px] leading-relaxed text-white/55">
                Your school admin creates teacher and student logins. When you
                have yours, sign in and start.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <ButtonLink
                  href="/login"
                  size="lg"
                  className="bg-white text-brand hover:bg-white/90"
                >
                  Sign in
                </ButtonLink>
                <ButtonLink
                  href="/register"
                  size="lg"
                  className="bg-white/10 text-white hover:bg-white/15"
                >
                  How to get access
                </ButtonLink>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="flex min-h-[18rem] items-center justify-center bg-white/5 px-6 py-12 lg:min-h-full lg:py-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease }}
          >
            <LandingIllustration
              src={landingIllustrations.cta}
              alt="Teachers and students working together in Learning Hub"
              className="w-full"
              imageClassName="max-w-lg illustration-quiet brightness-110"
            />
          </motion.div>
        </div>
      </section>
    </>
  );
}
