"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  LandingIllustration,
  landingIllustrations,
} from "@/components/landing/landing-illustration";
import { ButtonLink } from "@/components/ui/button-link";
import { APP_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const ease = [0.25, 1, 0.5, 1] as const;

const fade = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.25, ease },
};

const capabilities = [
  {
    number: "01",
    title: "Classes & codes",
    body: "Open a class, share a code, students join in seconds.",
    src: landingIllustrations.classes,
    alt: `A student with books in ${APP_NAME}`,
  },
  {
    number: "02",
    title: "Assignments & files",
    body: "Publish work with due dates and attachments. One submit flow.",
    src: landingIllustrations.assignments,
    alt: `Watching a lesson in ${APP_NAME}`,
  },
  {
    number: "03",
    title: "Grading & feedback",
    body: "See what’s waiting, score it, and reply without leaving the page.",
    src: landingIllustrations.grading,
    alt: `Focused grading work in ${APP_NAME}`,
  },
];

const steps = [
  {
    step: "01",
    title: "Get your account",
    body: "A school admin creates logins and shares them with staff and students.",
  },
  {
    step: "02",
    title: "Join the workspace",
    body: "Teachers set subjects and classes. Students enroll with a class code.",
  },
  {
    step: "03",
    title: "Run the school day",
    body: "Assign, collect, grade, and keep everyone looking at the same work.",
  },
];

const faqs = [
  {
    q: "How do I get an account?",
    a: "Accounts are created by your school administrator. Ask them for a login — then sign in here. Self-serve public signup is not how schools join.",
  },
  {
    q: "Can students register themselves?",
    a: "No. Students receive credentials from the school, then join classes with a code their teacher shares.",
  },
  {
    q: "What can teachers do?",
    a: "Create subjects and classes, publish assignments with files, collect submissions, grade work, and send feedback.",
  },
  {
    q: "Is this for one school or many?",
    a: `${APP_NAME} is built for schools as workspaces. A system admin can register multiple schools; each school’s people stay in their own space.`,
  },
];

export function LandingPillars() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      <section id="product" className="scroll-mt-16 px-4 py-12 sm:px-6 md:py-16">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fade} className="max-w-xl">
            <p className="text-[12px] font-medium tracking-[0.14em] text-brand uppercase">
              Product
            </p>
            <h2 className="mt-3 font-display text-[2rem] font-semibold leading-[1.1] tracking-[-0.02em] text-ink md:text-[2.5rem]">
              The workflow. Nothing extra.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink/55">
              {APP_NAME} keeps the pieces a class actually touches — and leaves
              the rest out.
            </p>
          </motion.div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {capabilities.map((item, index) => (
              <motion.article
                key={item.number}
                className="flex flex-col overflow-hidden rounded-lg border border-border bg-white"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.25, delay: index * 0.05, ease }}
              >
                <div className="flex h-52 shrink-0 items-center justify-center bg-landing px-6">
                  <LandingIllustration
                    src={item.src}
                    alt={item.alt}
                    fillHeight
                    className="h-40"
                    imageClassName="illustration-quiet"
                  />
                </div>
                <div className="flex flex-1 flex-col border-t border-border p-5">
                  <p className="font-mono text-[11px] text-ink/40">
                    {item.number}
                  </p>
                  <h3 className="mt-2 text-[16px] font-semibold tracking-tight text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink/55">
                    {item.body}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-16 px-4 py-12 sm:px-6 md:py-16"
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <motion.div {...fade} className="max-w-xl">
              <p className="text-[12px] font-medium tracking-[0.14em] text-brand uppercase">
                How it works
              </p>
              <h2 className="mt-3 font-display text-[2rem] font-semibold leading-[1.1] tracking-[-0.02em] text-ink md:text-[2.5rem]">
                Three steps. Then the real work.
              </h2>
            </motion.div>
            <motion.div
              className="hidden h-52 w-56 overflow-hidden rounded-lg border border-border bg-white lg:block"
              {...fade}
            >
              <div className="flex h-full items-center justify-center bg-landing px-4">
                <LandingIllustration
                  src={landingIllustrations.activity}
                  alt={`Working through class activity in ${APP_NAME}`}
                  fillHeight
                  className="h-40"
                  imageClassName="illustration-quiet"
                />
              </div>
            </motion.div>
          </div>

          <ol className="mt-10 overflow-hidden rounded-lg border border-border bg-white md:grid md:grid-cols-3">
            {steps.map((item, index) => (
              <motion.li
                key={item.step}
                className={cn(
                  "p-6 md:p-8",
                  index > 0 && "border-t border-border md:border-t-0 md:border-l",
                )}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.25, delay: index * 0.05, ease }}
              >
                <p className="font-mono text-[12px] text-brand">{item.step}</p>
                <h3 className="mt-4 text-[16px] font-semibold tracking-tight text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink/55">
                  {item.body}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section id="roles" className="scroll-mt-16 px-4 py-12 sm:px-6 md:py-16">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fade} className="max-w-xl">
            <p className="text-[12px] font-medium tracking-[0.14em] text-brand uppercase">
              Who it’s for
            </p>
            <h2 className="mt-3 font-display text-[2rem] font-semibold leading-[1.1] tracking-[-0.02em] text-ink md:text-[2.5rem]">
              Two roles. One shared desk.
            </h2>
          </motion.div>

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            <motion.article
              className="overflow-hidden rounded-lg border border-border bg-white"
              {...fade}
            >
              <div className="flex h-52 shrink-0 items-center justify-center bg-landing px-8">
                <LandingIllustration
                  src={landingIllustrations.teacher}
                  alt={`Teacher managing class assignments in ${APP_NAME}`}
                  fillHeight
                  className="h-40"
                  imageClassName="illustration-quiet"
                />
              </div>
              <div className="border-t border-border p-6">
                <p className="text-[12px] font-medium tracking-[0.12em] text-ink/40 uppercase">
                  Teachers
                </p>
                <h3 className="mt-2 text-[18px] font-semibold tracking-tight text-ink">
                  Time on teaching, not on hunting.
                </h3>
                <p className="mt-3 text-[14px] leading-relaxed text-ink/55">
                  Subjects, classes, assignments, submissions, and notifications
                  — structured so the next action is obvious.
                </p>
                <Link
                  href="/register"
                  className="mt-4 inline-flex text-[13px] font-medium text-ink underline-offset-4 transition-colors hover:text-brand-dark hover:underline"
                >
                  How teachers get access
                </Link>
              </div>
            </motion.article>

            <motion.article
              className="overflow-hidden rounded-lg border border-border bg-white"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.25, delay: 0.06, ease }}
            >
              <div className="flex h-52 shrink-0 items-center justify-center bg-landing px-8">
                <LandingIllustration
                  src={landingIllustrations.student}
                  alt={`Student reading and learning in ${APP_NAME}`}
                  fillHeight
                  className="h-40"
                  imageClassName="illustration-quiet"
                />
              </div>
              <div className="border-t border-border p-6">
                <p className="text-[12px] font-medium tracking-[0.12em] text-ink/40 uppercase">
                  Students
                </p>
                <h3 className="mt-2 text-[18px] font-semibold tracking-tight text-ink">
                  What’s due. What’s done. What’s next.
                </h3>
                <p className="mt-3 text-[14px] leading-relaxed text-ink/55">
                  Join a class, track deadlines, submit files, and read grades
                  and feedback in one view.
                </p>
                <Link
                  href="/register"
                  className="mt-4 inline-flex text-[13px] font-medium text-ink underline-offset-4 transition-colors hover:text-brand-dark hover:underline"
                >
                  How students get access
                </Link>
              </div>
            </motion.article>
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-16 px-4 py-12 sm:px-6 md:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <motion.div {...fade}>
            <p className="text-[12px] font-medium tracking-[0.14em] text-brand uppercase">
              FAQ
            </p>
            <h2 className="mt-3 font-display text-[2rem] font-semibold leading-[1.1] tracking-[-0.02em] text-ink md:text-[2.5rem]">
              Before you ask for a login.
            </h2>
            <div className="mt-8 hidden h-52 overflow-hidden rounded-lg border border-border bg-landing px-8 lg:flex lg:items-center lg:justify-center">
              <LandingIllustration
                src={landingIllustrations.materials}
                alt={`Preparing materials in ${APP_NAME}`}
                fillHeight
                className="h-40"
                imageClassName="illustration-quiet"
              />
            </div>
          </motion.div>

          <motion.div
            className="overflow-hidden rounded-lg border border-border bg-white"
            {...fade}
          >
            {faqs.map((item, index) => {
              const open = openFaq === index;
              return (
                <div
                  key={item.q}
                  className={cn(index > 0 && "border-t border-border")}
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenFaq(open ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-[15px] font-medium tracking-tight text-ink">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-ink/40 transition-transform duration-150 ease-craft",
                        open && "rotate-180",
                      )}
                    />
                  </button>
                  {open && (
                    <p className="px-5 pb-5 text-[14px] leading-relaxed text-ink/55">
                      {item.a}
                    </p>
                  )}
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6 md:pb-16">
        <motion.div
          className="mx-auto grid max-w-6xl overflow-hidden rounded-lg border border-border bg-white lg:grid-cols-2"
          {...fade}
        >
          <div className="flex flex-col justify-center p-8 md:p-10">
            <p className="text-[12px] font-medium tracking-[0.14em] text-brand uppercase">
              Get started
            </p>
            <h2 className="mt-3 font-display text-[2rem] font-semibold leading-[1.1] tracking-[-0.02em] text-ink">
              Ask for an account.
              <span className="mt-1 block text-brand">Then get to work.</span>
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink/55">
              Your school admin creates teacher and student logins. When you
              have yours, sign in and start.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/login" size="lg">
                Sign in
              </ButtonLink>
              <ButtonLink href="/register" variant="outline" size="lg" className="bg-white">
                How to get access
              </ButtonLink>
            </div>
          </div>
          <div className="flex h-52 items-center justify-center border-t border-border bg-landing px-8 lg:h-auto lg:min-h-full lg:border-l lg:border-t-0">
            <LandingIllustration
              src={landingIllustrations.cta}
              alt={`Teachers and students working together in ${APP_NAME}`}
              fillHeight
              className="h-40 lg:h-52"
              imageClassName="illustration-quiet"
            />
          </div>
        </motion.div>
      </section>
    </>
  );
}
