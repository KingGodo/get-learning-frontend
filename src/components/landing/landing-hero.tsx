"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  FileText,
  PenLine,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { APP_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const faces = [
  "/landing/avatars/teacher.webp",
  "/landing/avatars/student.webp",
  "/landing/avatars/peer.webp",
];

const assignments = [
  {
    icon: ClipboardList,
    tone: "bg-blue-50 text-blue-600",
    title: "Essay — Industrial Revolution",
    meta: "Mathematics 10A · Due Friday",
    status: "12 submitted",
    statusTone: "bg-blue-50 text-blue-700",
  },
  {
    icon: FileText,
    tone: "bg-sky-50 text-sky-700",
    title: "Lab report · Period 3",
    meta: "Science 11B · Awaiting grade",
    status: "8 left",
    statusTone: "bg-slate-100 text-slate-600",
  },
  {
    icon: PenLine,
    tone: "bg-indigo-50 text-indigo-600",
    title: "Quiz 4 — Algebra",
    meta: "Mathematics 10A · Returned",
    status: "Graded",
    statusTone: "bg-blue-50 text-blue-700",
  },
];

export function LandingHero() {
  return (
    <section className="px-4 sm:px-6">
      <div className="mx-auto flex max-w-[980px] flex-col items-center gap-2 py-10 md:py-16 lg:py-24">
        <Link
          href="#how-it-works"
          className="inline-flex max-w-full items-center gap-1 rounded-lg border border-border bg-white px-3 py-1 text-left text-sm font-medium text-foreground"
        >
          <Badge variant="secondary" className="h-5 shrink-0 rounded-md px-1.5">
            New
          </Badge>
          <span className="min-w-0">Accounts are created by your school</span>
          <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
        </Link>

        <h1 className="mt-4 max-w-[820px] text-center text-[2rem] font-bold tracking-tighter text-balance text-foreground sm:text-4xl md:text-6xl lg:leading-[1.1]">
          The class workspace for teachers{" "}
          <span
            className="mx-1 inline-flex translate-y-[0.08em] items-center align-middle"
            aria-hidden
          >
            {faces.map((src, i) => (
              <span
                key={src}
                className={cn(
                  "relative inline-block size-[0.82em] overflow-hidden rounded-full ring-2 ring-white",
                  i > 0 && "-ml-[0.22em]",
                )}
                style={{ zIndex: faces.length - i }}
              >
                <Image
                  src={src}
                  alt=""
                  width={96}
                  height={96}
                  className="size-full object-cover"
                  priority
                />
              </span>
            ))}
          </span>{" "}
          and students
        </h1>

        <p className="mt-3 max-w-[680px] text-center text-base text-balance text-muted-foreground sm:text-lg md:text-xl">
          Assign work, collect files, and send grades in one place. No extra
          modules. {APP_NAME} is issued by your school — then the day can start.
        </p>

        <div className="mt-6 flex w-full max-w-sm flex-col items-stretch gap-2 sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
          <ButtonLink href="/login" className="w-full sm:w-auto">
            Sign in
            <ArrowRight className="size-4" />
          </ButtonLink>
          <ButtonLink href="/register" variant="outline" className="w-full bg-white sm:w-auto">
            How to get access
          </ButtonLink>
        </div>
      </div>

      <div className="mx-auto max-w-5xl pb-16 md:pb-24">
        <HeroPreview />
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      <div className="flex items-center justify-between border-b border-border bg-landing px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="size-2.5 rounded-full bg-zinc-300" />
          <span className="size-2.5 rounded-full bg-zinc-300" />
          <span className="size-2.5 rounded-full bg-zinc-300" />
        </div>
        <p className="text-[13px] font-medium text-muted-foreground">
          {APP_NAME} · Mathematics 10A
        </p>
        <span className="w-12" />
      </div>

      <div className="grid lg:grid-cols-[13rem_minmax(0,1fr)]">
        <aside className="hidden border-r border-border p-4 lg:block">
          <p className="px-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            Class
          </p>
          <ul className="mt-2 space-y-1 text-[13px]">
            {["Assignments", "Students", "Materials", "Grades"].map(
              (item, i) => (
                <li
                  key={item}
                  className={cn(
                    "rounded-md px-2 py-1.5",
                    i === 0
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {item}
                </li>
              ),
            )}
          </ul>
        </aside>

        <div className="p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-foreground">
                Assignments
              </p>
              <p className="text-[12px] text-muted-foreground">
                This week in Mathematics 10A
              </p>
            </div>
            <Badge variant="outline">Teacher view</Badge>
          </div>
          <ul className="divide-y divide-border rounded-lg border border-border">
            {assignments.map((row) => (
              <li
                key={row.title}
                className="flex items-center justify-between gap-4 px-3 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      "inline-flex size-9 shrink-0 items-center justify-center rounded-md",
                      row.tone,
                    )}
                  >
                    <row.icon className="size-4" strokeWidth={1.75} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-foreground">
                      {row.title}
                    </p>
                    <p className="truncate text-[12px] text-muted-foreground">
                      {row.meta}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "hidden shrink-0 rounded-md px-2 py-1 text-[11px] font-medium sm:inline",
                    row.statusTone,
                  )}
                >
                  {row.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
