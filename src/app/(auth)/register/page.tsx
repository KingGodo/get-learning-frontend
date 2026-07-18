"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function RegisterPickerPage() {
  return (
    <>
      <div className="w-full max-w-[340px]">
        <h1 className="text-xl font-semibold tracking-tight text-black">
          Create your account
        </h1>
        <p className="mt-1 text-[13px] text-zinc-500">
          Choose how you&apos;ll use Lumen.
        </p>

        <div className="mt-7 space-y-2.5">
          <Link
            href="/register/teacher"
            className="group flex items-start justify-between gap-3 border border-zinc-200 px-4 py-4 transition-colors hover:border-[#0C1A2E]/25 hover:bg-zinc-50"
          >
            <div>
              <h2 className="text-sm font-semibold text-[#0C1A2E]">Teacher</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
                Create a school and manage classes.
              </p>
            </div>
            <ArrowRight className="mt-0.5 size-4 shrink-0 text-zinc-300 transition-colors group-hover:text-[#0C1A2E]" />
          </Link>

          <Link
            href="/register/student"
            className="group flex items-start justify-between gap-3 border border-zinc-200 px-4 py-4 transition-colors hover:border-[#0C1A2E]/25 hover:bg-zinc-50"
          >
            <div>
              <h2 className="text-sm font-semibold text-[#0C1A2E]">Student</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
                Join a class and submit work.
              </p>
            </div>
            <ArrowRight className="mt-0.5 size-4 shrink-0 text-zinc-300 transition-colors group-hover:text-[#0C1A2E]" />
          </Link>
        </div>

        <p className="mt-5 text-center text-[13px] text-zinc-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[#0C1A2E] hover:underline"
          >
            Sign in
          </Link>
        </p>
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
