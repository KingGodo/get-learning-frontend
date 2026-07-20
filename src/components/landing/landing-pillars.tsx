import Image from "next/image";
import Link from "next/link";

const capabilities = [
  {
    number: "01",
    title: "Classes & codes",
    body: "Open a class, share a code, and students enroll in seconds — no spreadsheets, no group chats.",
  },
  {
    number: "02",
    title: "Assignments & files",
    body: "Publish work with clear due dates and attachments. Students submit documents in one flow.",
  },
  {
    number: "03",
    title: "Grading & feedback",
    body: "See what’s waiting, score submissions, and send feedback without leaving the workspace.",
  },
];

const steps = [
  {
    step: "01",
    title: "Create your account",
    body: "Register as a teacher to run classes, or as a student to join with a code.",
  },
  {
    step: "02",
    title: "Set up the workspace",
    body: "Teachers add subjects and classes. Students join and see what’s due.",
  },
  {
    step: "03",
    title: "Teach and learn",
    body: "Assign work, collect submissions, grade, and keep everyone aligned.",
  },
];

const roles = [
  {
    title: "Built for teachers",
    body: "Subjects, classes, assignments, submissions, and notifications — structured so you spend time teaching, not hunting for work.",
    image: "/hero-classroom.jpg",
    imageClassName: "object-[center_30%]",
    alt: "Teacher preparing lessons with Lumen",
    href: "/register/teacher",
    cta: "Create teacher account",
  },
  {
    title: "Built for students",
    body: "Join a class, track deadlines, submit files, and see grades and feedback in one clear view.",
    image: "/hero.jpg",
    imageClassName: "object-center",
    alt: "Student working in Lumen",
    href: "/register/student",
    cta: "Create student account",
  },
];

export function LandingPillars() {
  return (
    <>
      <section id="product" className="scroll-mt-16 bg-white px-6 py-24 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                The product
              </p>
              <h2 className="mt-4 font-display text-[2rem] font-semibold leading-[1.15] tracking-tight text-[#0C1A2E] md:text-[2.5rem]">
                One LMS.
                <br />
                The essentials only.
              </h2>
              <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-zinc-500">
                Lumen focuses on the workflow that matters — without burying you
                in unused modules.
              </p>
            </div>

            <ul className="divide-y divide-zinc-200 border-y border-zinc-200">
              {capabilities.map((item) => (
                <li
                  key={item.number}
                  className="grid gap-4 py-8 sm:grid-cols-[4.5rem_1fr] sm:gap-8"
                >
                  <span className="font-mono text-[13px] font-medium tracking-wide text-zinc-300">
                    {item.number}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-[#0C1A2E]">
                      {item.title}
                    </h3>
                    <p className="mt-2 max-w-md text-[15px] leading-relaxed text-zinc-500">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-16 bg-[#0C1A2E] px-6 py-24 md:py-28"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
              How it works
            </p>
            <h2 className="mt-4 font-display text-[2rem] font-semibold leading-[1.15] tracking-tight text-white md:text-[2.5rem]">
              Up and running in three steps.
            </h2>
          </div>

          <ol className="mt-16 grid gap-0 md:grid-cols-3">
            {steps.map((item, index) => (
              <li
                key={item.step}
                className={
                  index < steps.length - 1
                    ? "border-b border-white/10 py-10 md:border-b-0 md:border-r md:py-0 md:pr-10 md:pl-0"
                    : "border-b border-white/10 py-10 last:border-b-0 md:border-b-0 md:py-0 md:pl-10"
                }
              >
                <p className="font-display text-4xl font-semibold tracking-tight text-white/20 md:text-5xl">
                  {item.step}
                </p>
                <h3 className="mt-6 text-lg font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-white/50">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white px-6 py-24 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Who it’s for
            </p>
            <h2 className="mt-4 font-display text-[2rem] font-semibold leading-[1.15] tracking-tight text-[#0C1A2E] md:text-[2.5rem]">
              Two roles. One shared workspace.
            </h2>
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:gap-12">
            {roles.map((role) => (
              <article key={role.title} className="group">
                <div className="relative aspect-[5/4] overflow-hidden bg-zinc-100">
                  <Image
                    src={role.image}
                    alt={role.alt}
                    fill
                    unoptimized
                    className={`object-cover transition-transform duration-700 group-hover:scale-[1.02] ${role.imageClassName ?? "object-center"}`}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <h3 className="mt-7 text-xl font-semibold tracking-tight text-[#0C1A2E]">
                  {role.title}
                </h3>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-zinc-500">
                  {role.body}
                </p>
                <Link
                  href={role.href}
                  className="mt-5 inline-flex text-sm font-semibold text-[#0C1A2E] underline-offset-4 hover:underline"
                >
                  {role.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-[#0C1A2E]">
        <div className="grid lg:grid-cols-2">
          <div className="relative flex flex-col justify-center bg-[#0C1A2E] px-6 py-20 sm:px-10 md:py-24 lg:px-14 xl:px-16">
            <div className="relative max-w-lg">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Try Lumen today.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-white/60 sm:text-base">
                Create a free account and start with your first class — or join
                one with a code.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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
              </div>
              <p className="mt-6 text-[13px] text-white/45">
                Already using Lumen?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-white/80 transition-colors hover:text-white"
                >
                  Sign in →
                </Link>
              </p>
            </div>
          </div>

          <div className="relative min-h-[280px] lg:min-h-full">
            <Image
              src="/hero-classroom.jpg"
              alt="Team collaborating with Lumen"
              fill
              unoptimized
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>
    </>
  );
}
