"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronDown, Search } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { subjectsApi } from "@/lib/api";
import { toast, toastFromError } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Textarea } from "@/components/ui/textarea";
import { PageLoading } from "@/components/ui/page-loading";
import { cn } from "@/lib/utils";

const SUBJECT_CATALOG: Array<{ name: string; code: string }> = [
  { name: "Accounting", code: "ACC" },
  { name: "Afrikaans Home Language", code: "AFR-HL" },
  { name: "Afrikaans First Additional Language", code: "AFR-FAL" },
  { name: "Agricultural Sciences", code: "AGRI" },
  { name: "Agricultural Technology", code: "AGRI-TECH" },
  { name: "Arabic", code: "ARA" },
  { name: "Art / Visual Arts", code: "ART" },
  { name: "Biology / Life Sciences", code: "BIO" },
  { name: "Business Studies", code: "BUS" },
  { name: "Chemistry", code: "CHEM" },
  { name: "Civil Technology", code: "CIV-TECH" },
  { name: "Computer Applications Technology", code: "CAT" },
  { name: "Consumer Studies", code: "CONS" },
  { name: "Creative Arts", code: "CA" },
  { name: "Dance Studies", code: "DANCE" },
  { name: "Design", code: "DES" },
  { name: "Dramatic Arts", code: "DRAMA" },
  { name: "Economics", code: "ECON" },
  { name: "Electrical Technology", code: "ELEC-TECH" },
  { name: "Engineering Graphics & Design", code: "EGD" },
  { name: "English Home Language", code: "ENG-HL" },
  { name: "English First Additional Language", code: "ENG-FAL" },
  { name: "Environmental Sciences", code: "ENV" },
  { name: "French", code: "FRE" },
  { name: "Geography", code: "GEO" },
  { name: "German", code: "GER" },
  { name: "Health Sciences", code: "HEALTH" },
  { name: "History", code: "HIST" },
  { name: "Hospitality Studies", code: "HOSP" },
  { name: "Information Technology", code: "IT" },
  { name: "IsiNdebele", code: "NDE" },
  { name: "IsiXhosa Home Language", code: "XHO-HL" },
  { name: "IsiXhosa First Additional Language", code: "XHO-FAL" },
  { name: "IsiZulu Home Language", code: "ZUL-HL" },
  { name: "IsiZulu First Additional Language", code: "ZUL-FAL" },
  { name: "Life Orientation", code: "LO" },
  { name: "Life Sciences", code: "LIFE" },
  { name: "Mathematical Literacy", code: "MATH-LIT" },
  { name: "Mathematics", code: "MATH" },
  { name: "Mechanical Technology", code: "MECH-TECH" },
  { name: "Music", code: "MUS" },
  { name: "Natural Sciences", code: "NS" },
  { name: "Physical Sciences", code: "PHY" },
  { name: "Portuguese", code: "POR" },
  { name: "Religion Studies", code: "REL" },
  { name: "Sepedi Home Language", code: "SEP-HL" },
  { name: "Sesotho Home Language", code: "SOT-HL" },
  { name: "Setswana Home Language", code: "TSW-HL" },
  { name: "SiSwati Home Language", code: "SWA-HL" },
  { name: "Social Sciences", code: "SS" },
  { name: "Sport & Exercise Science", code: "SPORT" },
  { name: "Technology", code: "TECH" },
  { name: "Tourism", code: "TOUR" },
  { name: "Tshivenda Home Language", code: "VEN-HL" },
  { name: "Xitsonga Home Language", code: "TSO-HL" },
];

export default function NewSubjectPage() {
  const { user } = useAuth();
  const router = useRouter();
  const canManage = user?.role === "SCHOOL_ADMIN" || user?.role === "ADMIN";
  const isSchoolAdmin = user?.role === "SCHOOL_ADMIN";
  const [pending, setPending] = useState(false);
  const [existingCount, setExistingCount] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", code: "", description: "" });

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && !canManage) router.replace("/subjects");
  }, [user, canManage, router]);

  useEffect(() => {
    if (!canManage) return;
    let cancelled = false;
    subjectsApi
      .list()
      .then((rows) => {
        if (!cancelled) setExistingCount(rows.length);
      })
      .catch(() => {
        if (!cancelled) setExistingCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [canManage]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return SUBJECT_CATALOG;
    return SUBJECT_CATALOG.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q),
    );
  }, [search]);

  function selectSubject(s: { name: string; code: string }) {
    setForm((f) => ({ ...f, name: s.name, code: s.code }));
    setSearch("");
    setOpen(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      await subjectsApi.create({
        name: form.name,
        code: form.code.trim().toUpperCase(),
        description: form.description || undefined,
      });
      const firstSubject = (existingCount ?? 0) === 0;
      if (isSchoolAdmin && firstSubject) {
        toast.success(
          "Subject created",
          "Next: create a class under this subject.",
        );
        router.push("/classes/new");
      } else {
        toast.success("Subject created");
        router.push("/subjects");
      }
    } catch (err) {
      toastFromError(err, "Could not create");
      setPending(false);
    }
  }

  if (!user) {
    return <PageLoading label="Loading…" />;
  }

  return (
    <div className="relative mx-auto max-w-xl space-y-8">
      {pending && <PageLoading overlay label="Creating subject…" />}
      <div>
        <Link
          href="/subjects"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-500 transition-colors hover:text-brand-dark"
        >
          <ArrowLeft className="size-3.5" />
          Back to subjects
        </Link>
        <PageHeader
          title="Add a subject"
          description={
            isSchoolAdmin
              ? "Pick from common subjects or type your own. After this, create a class under the subject."
              : "Pick from common subjects or type your own. Assign subjects to teachers when you add or edit them."
          }
          className="mt-4 pb-0"
        />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5" ref={wrapperRef}>
          <Label className="text-[13px] text-zinc-600">Subject</Label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className={cn(
                "flex h-9 w-full items-center justify-between rounded-md border border-border bg-white px-2.5 text-sm transition-colors",
                "hover:border-brand/40 focus:border-brand/40 focus:outline-none focus:ring-1 focus:ring-brand/20",
                !form.name && "text-muted-foreground",
              )}
            >
              <span className="truncate">
                {form.name
                  ? `${form.name} (${form.code})`
                  : "Search or pick a subject…"}
              </span>
              <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
            </button>

            {open && (
              <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-white py-1 shadow-lg">
                <div className="flex items-center gap-2 border-b border-border px-2.5 pb-2 pt-1.5">
                  <Search className="size-3.5 shrink-0 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Type to search…"
                    className="h-7 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    autoFocus
                  />
                </div>
                <ul className="max-h-56 overflow-y-auto py-1">
                  {filtered.length === 0 ? (
                    <li className="px-3 py-4 text-center text-[13px] text-muted-foreground">
                      No match — type a custom name below.
                    </li>
                  ) : (
                    filtered.map((s) => {
                      const selected =
                        form.name === s.name && form.code === s.code;
                      return (
                        <li key={s.code}>
                          <button
                            type="button"
                            onClick={() => selectSubject(s)}
                            className={cn(
                              "flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors",
                              selected
                                ? "bg-brand-light/40 text-brand-dark"
                                : "text-ink hover:bg-muted/60",
                            )}
                          >
                            <span
                              className={cn(
                                "inline-flex size-4 shrink-0 items-center justify-center",
                                selected ? "text-brand" : "text-transparent",
                              )}
                            >
                              <Check className="size-3.5" />
                            </span>
                            <span className="flex-1 truncate">{s.name}</span>
                            <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                              {s.code}
                            </span>
                          </button>
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>
            )}
          </div>
          <p className="text-[12px] text-zinc-400">
            Pick from the list, or enter a custom name and code below.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-[13px] text-zinc-600">
              Name
            </Label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="h-9 rounded-md bg-transparent"
              placeholder="Mathematics"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="code" className="text-[13px] text-zinc-600">
              Code
            </Label>
            <Input
              id="code"
              required
              value={form.code}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  code: e.target.value.toUpperCase(),
                }))
              }
              className="h-9 rounded-md bg-transparent font-mono uppercase"
              placeholder="MATH"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-[13px] text-zinc-600">
            Description
          </Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            className="rounded-md bg-transparent"
            rows={4}
            placeholder="Optional short description"
          />
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="submit" disabled={pending} size="sm">
            {pending ? "Creating…" : "Create subject"}
          </Button>
          <ButtonLink href="/subjects" variant="outline" size="sm">
            Cancel
          </ButtonLink>
        </div>
      </form>
    </div>
  );
}
