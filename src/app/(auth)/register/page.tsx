"use client";

import Image from "next/image";
import Link from "next/link";

export default function RegisterInfoPage() {
  return (
    <>
      <div className="w-full max-w-[380px]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
          Account access
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-brand-dark">
          Accounts are created by your school
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-zinc-500">
          Teachers and students can no longer self-register. Ask your school
          admin to create your account, then use the credentials they share with
          you to sign in.
        </p>

        <div className="mt-6 space-y-3 border-y border-zinc-200/80 py-5 text-[13px] text-zinc-600">
          <p>
            <span className="font-medium text-brand-dark">Teachers:</span>{" "}
            contact your school admin for a one-time login password.
          </p>
          <p>
            <span className="font-medium text-brand-dark">Students:</span>{" "}
            contact your school admin for a one-time login password.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          <Link
            href="/login"
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-brand-dark px-4 text-sm font-medium text-white transition-colors hover:bg-brand-dark-hover"
          >
            Sign in
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 w-full items-center justify-center rounded-md px-4 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-brand-dark"
          >
            Back to home
          </Link>
        </div>
      </div>

      <Image
        src="/teacher.svg"
        alt=""
        width={280}
        height={220}
        className="pointer-events-none absolute bottom-4 right-4 w-[min(40vw,280px)] select-none sm:bottom-6 sm:right-8"
        priority
      />
    </>
  );
}
