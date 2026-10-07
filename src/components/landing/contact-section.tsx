"use client";

import { useState, type FormEvent } from "react";
import { Check, Mail } from "lucide-react";
import { z } from "zod";
import { ApiRequestError, api } from "@/lib/api";
import {
  fieldErrorsFromApi,
  firstFieldError,
  parseForm,
  type FieldErrors,
} from "@/lib/validation/form";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { APP_NAME } from "@/lib/brand";

const notes = [
  {
    title: "A question about the product",
    body: "Classes, assignments, grades, or how a school gets started.",
  },
  {
    title: "Help with an account",
    body: "Accounts are issued by the school. Tell us what is stuck.",
  },
  {
    title: "A short note is enough",
    body: "We read every message and reply to the email you enter.",
  },
];

const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80, "Name is too long"),
  email: z.email("Enter a valid email address"),
  message: z
    .string()
    .trim()
    .min(10, "Write a short message")
    .max(2000, "Message is too long"),
});

export function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const parsed = parseForm(contactSchema, { name, email, message });
    if (!parsed.ok) {
      setFieldErrors(parsed.fieldErrors);
      return;
    }
    setFieldErrors({});
    setPending(true);
    try {
      await api<{ message: string }>("/contact", {
        method: "POST",
        body: parsed.data,
        token: null,
      });
      setSent(true);
    } catch (error) {
      const errors = fieldErrorsFromApi(error);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
      }
      setFormError(
        error instanceof ApiRequestError
          ? error.message
          : "The message could not be sent. Try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <section id="contact" className="scroll-mt-28 px-4 pb-20 sm:px-6 sm:pb-28">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 lg:grid lg:grid-cols-2">
        <div className="flex flex-col bg-brand p-8 text-white sm:p-10">
          <div className="flex size-10 items-center justify-center rounded-lg bg-white/15">
            <Mail className="size-4" aria-hidden="true" />
          </div>
          <h2 className="mt-6 max-w-[14ch] font-display text-[1.75rem] leading-snug font-medium tracking-tight text-white sm:text-[2rem]">
            Send a message
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-blue-100">
            Write to {APP_NAME} about the product or an account. We reply to
            the email you enter.
          </p>
          <ul className="mt-8 space-y-5">
            {notes.map((note) => (
              <li key={note.title}>
                <p className="text-sm font-semibold text-white">{note.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-blue-100">
                  {note.body}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-8 sm:p-10">
          {sent ? (
            <div className="flex h-full min-h-72 flex-col justify-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-brand-light text-brand">
                <Check className="size-4" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-display text-[1.75rem] leading-snug font-medium tracking-tight text-zinc-950">
                Message sent
              </h3>
              <p className="mt-2 max-w-[36ch] text-sm leading-relaxed text-zinc-600">
                We will reply to {email}.
              </p>
            </div>
          ) : (
            <form className="grid gap-5" onSubmit={onSubmit} noValidate>
              <div>
                <h3 className="text-base font-semibold text-zinc-950">
                  Your details
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                  Name, email, and what you want us to know.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="contact-name">Name</Label>
                  <Input
                    id="contact-name"
                    name="name"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    aria-invalid={Boolean(fieldErrors.name)}
                    className="h-11 bg-zinc-50"
                  />
                  <FieldError message={fieldErrors.name} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    aria-invalid={Boolean(fieldErrors.email)}
                    className="h-11 bg-zinc-50"
                  />
                  <FieldError message={fieldErrors.email} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact-message">Message</Label>
                <Textarea
                  id="contact-message"
                  name="message"
                  rows={6}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  aria-invalid={Boolean(fieldErrors.message)}
                  className="min-h-36 bg-zinc-50"
                />
                <FieldError message={fieldErrors.message} />
              </div>
              {formError && !firstFieldError(fieldErrors) ? (
                <FieldError message={formError} />
              ) : null}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-zinc-500">
                  We only use this to reply.
                </p>
                <Button type="submit" disabled={pending}>
                  {pending ? "Sending" : "Send message"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
