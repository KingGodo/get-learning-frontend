import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpen,
  ChevronDown,
  ClipboardList,
  ScrollText,
  Users,
} from "lucide-react";
import { ContactSection } from "@/components/landing/contact-section";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { APP_NAME } from "@/lib/brand";

const features = [
  {
    id: "classes",
    icon: BookOpen,
    title: "Classes",
    body: "A teacher opens a class and shares a join code. Students enter the code and see the same work, including files the teacher has shared with the class.",
  },
  {
    id: "assignments",
    icon: ClipboardList,
    title: "Assignments",
    body: "Publish the task, attach a file, and set when it is due. Every submission for that class sits in one list, so nothing is collected in a side chat.",
  },
  {
    id: "grades",
    icon: BadgeCheck,
    title: "Grades",
    body: "Score the work and send it back. The student sees the grade. A parent linked to that student sees the same result.",
  },
  {
    id: "parents",
    icon: Users,
    title: "Parents",
    body: "A parent account shows only the children the school has linked. Their classes, assignments, and grades stay in that view.",
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Teacher analytics",
    body: "Teachers can see how each class and each assignment is going: who has handed work in, and where the grades sit.",
  },
  {
    id: "audit",
    icon: ScrollText,
    title: "Audit log",
    body: "School admins and headmasters can read a log of important changes, so the school can see who updated an account or a record.",
  },
];

const roles = [
  {
    title: "School admin",
    body: "Creates teachers, students, parents, and the headmaster. Assigns subjects, issues the first login, and applies a correction when someone reports a wrong detail.",
  },
  {
    title: "Teacher",
    body: "Runs classes, publishes assignments, grades submissions, and reviews each class from the analytics page. Subjects and classes are set by the school.",
  },
  {
    title: "Student",
    body: "Reviews their details on the first sign in, joins a class with a code, hands work in, and sees the grade when it comes back.",
  },
  {
    title: "Parent",
    body: "Signs in to follow the children linked to them. They can see classes, work, and grades, and they cannot see the rest of the school.",
  },
  {
    title: "Headmaster",
    body: "Reads the school, including the audit log, without having to run a class or grade a submission.",
  },
];

const steps = [
  {
    n: "01",
    title: "The school creates the account",
    body: "A school admin issues the first login for a teacher or a student. There is no public signup, and the temporary password is only for that first visit.",
  },
  {
    n: "02",
    title: "They review it, then set a password",
    body: "On the first sign in they check the details the school entered. If something is wrong, they send a correction and wait. If it is right, they choose a password they will remember.",
  },
  {
    n: "03",
    title: "The class runs from here",
    body: "The teacher assigns the work. Students hand it in. The grade goes back to the student, and to any parent linked to them.",
  },
];

const faqs = [
  {
    q: "How do I get an account?",
    a: "Your school creates it. Ask a school admin for the first login, then sign in here and review your details.",
  },
  {
    q: "Can students register themselves?",
    a: "No. Students receive credentials from the school, then join a class with the code their teacher shares.",
  },
  {
    q: "What happens on the first sign in?",
    a: "Teachers and students review the details the school entered, including name and phone. Students also see guardian details. If something is wrong, they send a correction to the school admin. If it is right, they set their own password. They cannot do both at once.",
  },
  {
    q: "What if my subjects or classes are wrong?",
    a: "Subjects and classes are read only on that first review. Write the correction in the note and the school admin applies it. You set a password after the details are right.",
  },
  {
    q: "What can a parent see?",
    a: "Only the children linked to that parent: their classes, assignments, and grades. A parent does not see other students.",
  },
  {
    q: "Who can read the audit log?",
    a: "Platform admins, school admins, and headmasters. Teachers, students, and parents do not have that page.",
  },
];

export function LandingHome() {
  return (
    <>
      <section id="home" className="relative h-svh w-full bg-black">
        <Image
          src="/landing/photos/hero-teens.jpg"
          alt="Two students working together on a laptop"
          width={2000}
          height={1333}
          priority
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div
          className="absolute inset-0 bg-black/65"
          aria-hidden="true"
        />
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-20 pb-6 sm:px-6 sm:pb-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <h1 className="max-w-[14ch] font-display text-[1.75rem] leading-[1.12] font-medium tracking-tight text-white sm:text-[2.5rem]">
                The class, the work, and the grade.
              </h1>
              <p className="mt-4 max-w-[34ch] text-[15px] leading-relaxed text-white/80">
                A teacher publishes the task. A student hands it in. The result
                goes back to that student, and to the parent the school linked.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <ButtonLink
                  href="/login"
                  className="bg-white text-brand hover:bg-brand-light"
                >
                  Sign in
                  <ArrowRight />
                </ButtonLink>
                <a
                  href="#product"
                  className="inline-flex h-10 cursor-pointer items-center rounded-md px-3 text-sm font-medium text-white transition-colors duration-150 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
                >
                  See what it covers
                </a>
              </div>
            </div>
            <div className="w-full max-w-[18rem] shrink-0 rounded-xl border border-white/25 bg-white/10 p-4 text-white shadow-lg backdrop-blur-md">
              <p className="text-xs font-medium text-white/70">One place</p>
              <p className="mt-2 text-sm font-semibold leading-snug">
                The task, the file, and the grade stay together
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-white/80">
                The work lives with the class. Nothing has to be collected in
                a side chat or a spreadsheet.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="product" className="scroll-mt-28 px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <h2 className="font-display text-[1.75rem] leading-snug font-medium tracking-tight text-zinc-950">
              What a school actually does here
            </h2>
            <p className="mt-3 text-base leading-relaxed text-zinc-600">
              {APP_NAME} covers the work of a class, plus the people around it:
              parents, the headmaster, and the school admin who creates the
              accounts.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
              <Card key={feature.title} id={feature.id} className="scroll-mt-28 bg-white">
                <CardHeader>
                  <div className="mb-2 flex size-8 items-center justify-center rounded-md bg-brand-light text-brand">
                    <Icon className="size-4" aria-hidden="true" />
                  </div>
                  <CardTitle className="font-sans text-[15px] font-semibold">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-zinc-600">
                    {feature.body}
                  </CardDescription>
                </CardHeader>
              </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-14 sm:px-6 sm:pb-16">
        <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-2">
          <Card className="overflow-hidden bg-white pt-0">
            <div className="relative aspect-[3/2] bg-zinc-100">
              <Image
                src="/landing/photos/study.jpg"
                alt="A student on a laptop during a lesson"
                fill
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle className="font-sans text-base font-semibold">
                Students join with a code
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed text-zinc-600">
                After the first sign in, a student enters the code their
                teacher shared. The class list, the assignments, and the
                grades for that class are waiting there. They do not need a
                separate tool to hand the work in.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="overflow-hidden bg-white pt-0">
            <div className="relative aspect-[3/2] bg-zinc-100">
              <Image
                src="/landing/photos/teach.jpg"
                alt="A teacher leading a lesson with students in class"
                fill
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-cover object-[center_40%]"
              />
            </div>
            <CardHeader>
              <CardTitle className="font-sans text-base font-semibold">
                Teachers keep the class in one place
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed text-zinc-600">
                The teacher publishes the task, collects every submission, and
                returns a grade. Analytics shows how that class and that
                assignment are going, without exporting a spreadsheet.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section id="roles" className="scroll-mt-28 px-4 pb-14 sm:px-6 sm:pb-16">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <h2 className="font-display text-[1.75rem] leading-snug font-medium tracking-tight text-zinc-950">
              Five ways to sign in
            </h2>
            <p className="mt-3 text-base leading-relaxed text-zinc-600">
              Each account sees only its own work. A parent does not see the
              staff list. A student does not see the audit log.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {roles.map((role) => (
              <Card key={role.title} size="sm" className="bg-white">
                <CardHeader>
                  <CardTitle className="font-sans text-[15px] font-semibold">
                    {role.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-zinc-600">
                    {role.body}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-28 px-4 pb-14 sm:px-6 sm:pb-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-[1.75rem] leading-snug font-medium tracking-tight text-zinc-950">
            How a school starts
          </h2>
          <Card className="mt-6 gap-0 bg-white py-0">
            <ol>
              {steps.map((step, index) => (
                <li key={step.n}>
                  {index > 0 && <Separator />}
                  <div className="grid gap-2 px-4 py-4 sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-6 sm:px-4">
                    <p className="font-mono text-sm text-zinc-500">{step.n}</p>
                    <div>
                      <h3 className="text-[15px] font-semibold text-zinc-950">
                        {step.title}
                      </h3>
                      <p className="mt-1.5 max-w-[68ch] text-sm leading-relaxed text-zinc-600">
                        {step.body}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </section>

      <section id="schools" className="px-4 pb-14 sm:px-6 sm:pb-16">
        <div className="mx-auto max-w-6xl">
          <Card className="border-transparent bg-brand text-white ring-0">
            <div className="flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <h2 className="text-lg font-semibold text-white">
                  Sign in with the account your school gave you
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-blue-100">
                  Teachers and students confirm their details before they
                  choose a password. If a detail is wrong, the school admin
                  applies the correction first.
                </p>
              </div>
              <ButtonLink
                href="/login"
                className="bg-white text-brand hover:bg-brand-light"
              >
                Sign in
              </ButtonLink>
            </div>
          </Card>
        </div>
      </section>

      <section id="faq" className="scroll-mt-28 px-4 pb-16 sm:px-6 sm:pb-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-16">
          <div className="max-w-md">
            <h2 className="font-display text-[1.75rem] leading-snug font-medium tracking-tight text-zinc-950">
              Questions
            </h2>
            <p className="mt-3 text-base leading-relaxed text-zinc-600">
              Accounts come from the school. These are the details people ask
              about before the first sign in.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {faqs.map((item, index) => (
              <details
                key={item.q}
                {...(index === 0 ? { open: true } : {})}
                className="group rounded-xl bg-white ring-1 ring-zinc-200 open:ring-zinc-300"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-sm font-semibold text-zinc-950 [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDown
                    className="size-4 shrink-0 text-zinc-400 transition-transform duration-150 group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="px-4 pb-4 text-sm leading-relaxed text-zinc-600">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <ContactSection />
    </>
  );
}
