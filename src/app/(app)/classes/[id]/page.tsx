"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Copy,
  Plus,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MaterialPreviewCard } from "@/components/files/material-preview-card";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiRequestError, classesApi, materialsApi } from "@/lib/api";
import { toast, toastFromError } from "@/lib/toast";
import type { ClassMaterial, ClassRoom } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ListPagination } from "@/components/ui/list-pagination";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { StatusBadge, statusToneFor } from "@/components/ui/status-badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const PAGE_SIZE = 20;

type ClassTab = "students" | "materials";
type MaterialSort = "newest" | "oldest" | "title";
type StudentSort = "name" | "number" | "email";

function tabFromHash(hash: string): ClassTab {
  if (hash === "#materials") return "materials";
  return "students";
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const UUID_TITLE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?:\s*\(\d+\))?$/i;

function materialDisplayTitle(title: string, attachment: string) {
  const cleaned = title.trim();
  if (!UUID_TITLE.test(cleaned)) return cleaned;

  const ext = attachment.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "PDF document";
  if (ext === "doc" || ext === "docx") return "Word document";
  return "Reading material";
}

export default function ClassDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const canUpload = user?.role === "TEACHER" || user?.role === "ADMIN";

  const [data, setData] = useState<ClassRoom | null>(null);
  const [materials, setMaterials] = useState<ClassMaterial[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<ClassMaterial | null>(null);
  const [removing, setRemoving] = useState(false);

  const [tab, setTab] = useState<ClassTab>("students");

  const [materialQuery, setMaterialQuery] = useState("");
  const [materialSort, setMaterialSort] = useState<MaterialSort>("newest");
  const [materialPage, setMaterialPage] = useState(1);

  const [studentQuery, setStudentQuery] = useState("");
  const [studentSort, setStudentSort] = useState<StudentSort>("name");
  const [studentPage, setStudentPage] = useState(1);

  const loadMaterials = useCallback(async () => {
    try {
      setMaterials(await materialsApi.list(params.id));
    } catch {
      setMaterials([]);
    }
  }, [params.id]);

  useEffect(() => {
    setError(null);
    setData(null);
    classesApi
      .get(params.id)
      .then(async (classRoom) => {
        setData(classRoom);
        await loadMaterials();
      })
      .catch((err) =>
        setError(err instanceof ApiRequestError ? err.message : "Not found"),
      );
  }, [params.id, loadMaterials]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setTab(tabFromHash(window.location.hash));
  }, [data]);

  function switchTab(next: ClassTab) {
    setTab(next);
    if (typeof window === "undefined") return;
    const hash = next === "materials" ? "#materials" : "#students";
    const url = `${window.location.pathname}${window.location.search}${hash}`;
    window.history.replaceState(null, "", url);
  }

  async function copyCode() {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.classCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Could not copy class code");
    }
  }

  async function onRemoveConfirm() {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      await materialsApi.remove(params.id, removeTarget.id);
      setRemoveTarget(null);
      await loadMaterials();
    } catch (err) {
      toastFromError(err, "Could not remove material");
    } finally {
      setRemoving(false);
    }
  }

  const students = data?.classStudents ?? [];
  const teachers = data?.classTeachers ?? [];

  const filteredMaterials = useMemo(() => {
    const q = materialQuery.trim().toLowerCase();
    const filtered = materials.filter((m) => {
      if (!q) return true;
      return (
        m.title.toLowerCase().includes(q) ||
        (m.description?.toLowerCase().includes(q) ?? false) ||
        (m.teacher?.user
          ? `${m.teacher.user.firstName} ${m.teacher.user.lastName}`
              .toLowerCase()
              .includes(q)
          : false)
      );
    });
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (materialSort === "title") return a.title.localeCompare(b.title);
      const diff =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return materialSort === "oldest" ? diff : -diff;
    });
    return sorted;
  }, [materials, materialQuery, materialSort]);

  const materialTotalPages = Math.max(
    1,
    Math.ceil(filteredMaterials.length / PAGE_SIZE),
  );
  const materialCurrentPage = Math.min(materialPage, materialTotalPages);
  const materialPageItems = useMemo(() => {
    const start = (materialCurrentPage - 1) * PAGE_SIZE;
    return filteredMaterials.slice(start, start + PAGE_SIZE);
  }, [filteredMaterials, materialCurrentPage]);
  const materialRangeStart =
    filteredMaterials.length === 0
      ? 0
      : (materialCurrentPage - 1) * PAGE_SIZE + 1;
  const materialRangeEnd = Math.min(
    materialCurrentPage * PAGE_SIZE,
    filteredMaterials.length,
  );

  const filteredStudents = useMemo(() => {
    const q = studentQuery.trim().toLowerCase();
    const filtered = students.filter((s) => {
      if (!q) return true;
      const name =
        `${s.student.user.firstName} ${s.student.user.lastName}`.toLowerCase();
      return (
        name.includes(q) ||
        s.student.user.email.toLowerCase().includes(q) ||
        (s.student.studentNumber?.toLowerCase().includes(q) ?? false) ||
        (s.student.user.phoneNumber?.toLowerCase().includes(q) ?? false)
      );
    });
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (studentSort === "email") {
        return a.student.user.email.localeCompare(b.student.user.email);
      }
      if (studentSort === "number") {
        return (a.student.studentNumber ?? "").localeCompare(
          b.student.studentNumber ?? "",
        );
      }
      const nameA = `${a.student.user.firstName} ${a.student.user.lastName}`;
      const nameB = `${b.student.user.firstName} ${b.student.user.lastName}`;
      return nameA.localeCompare(nameB);
    });
    return sorted;
  }, [students, studentQuery, studentSort]);

  const studentTotalPages = Math.max(
    1,
    Math.ceil(filteredStudents.length / PAGE_SIZE),
  );
  const studentCurrentPage = Math.min(studentPage, studentTotalPages);
  const studentPageItems = useMemo(() => {
    const start = (studentCurrentPage - 1) * PAGE_SIZE;
    return filteredStudents.slice(start, start + PAGE_SIZE);
  }, [filteredStudents, studentCurrentPage]);
  const studentRangeStart =
    filteredStudents.length === 0
      ? 0
      : (studentCurrentPage - 1) * PAGE_SIZE + 1;
  const studentRangeEnd = Math.min(
    studentCurrentPage * PAGE_SIZE,
    filteredStudents.length,
  );

  useEffect(() => {
    setMaterialPage(1);
  }, [materialQuery, materialSort]);

  useEffect(() => {
    setStudentPage(1);
  }, [studentQuery, studentSort]);

  if (error && !data) {
    return (
      <div className="space-y-4">
        <Link
          href="/classes"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-500 hover:text-brand-dark"
        >
          <ArrowLeft className="size-3.5" />
          Classes
        </Link>
        <div
          className="border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
          role="alert"
        >
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return <PageLoading label="Loading class…" />;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col space-y-6">
      <div>
        <Link
          href="/classes"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-500 transition-colors hover:text-brand-dark"
        >
          <ArrowLeft className="size-3.5" />
          Classes
        </Link>

        <PageHeader
          eyebrow={data.subject?.name ?? "Class"}
          title={data.name}
          description={data.description ?? undefined}
          className="mt-4 pb-0"
          actions={
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void copyCode()}
                className="w-full justify-between font-mono text-[13px] sm:w-auto sm:justify-center"
              >
                <span className="truncate">{data.classCode}</span>
                <span className="inline-flex items-center gap-1.5">
                  {copied ? (
                    <Check className="size-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="size-3.5 text-muted-foreground" />
                  )}
                  <span className="font-sans text-[11px] font-medium text-muted-foreground">
                    {copied ? "Copied" : "Copy"}
                  </span>
                </span>
              </Button>
              <div className="flex flex-wrap gap-2">
                {canUpload && (
                  <>
                    <ButtonLink
                      href={`/assignments/new?classId=${data.id}`}
                      size="sm"
                      className="justify-center"
                    >
                      New assignment
                    </ButtonLink>
                    <ButtonLink
                      href={`/classes/${data.id}/materials/new`}
                      variant="outline"
                      size="sm"
                      className="justify-center"
                    >
                      <Plus className="size-3.5" />
                      Add material
                    </ButtonLink>
                  </>
                )}
              </div>
            </div>
          }
        />

        {data.subject && (
          <p className="mt-2 text-[13px] text-muted-foreground">
            <Link
              href={`/subjects/${data.subject.id}`}
              className="font-medium text-ink hover:underline"
            >
              View subject
            </Link>
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <StatusBadge tone={statusToneFor(data.status)}>
            {data.status.charAt(0) + data.status.slice(1).toLowerCase()}
          </StatusBadge>
          <StatusBadge tone="neutral">
            {data.academicYear} · Sem {data.semester}
          </StatusBadge>
        </div>

        <div className="mt-4">
          <p className="text-[12px] font-medium text-muted-foreground">
            Class teacher{teachers.length === 1 ? "" : "s"}
          </p>
          {teachers.length === 0 ? (
            <p className="mt-1 text-[13px] text-zinc-400">No teachers listed.</p>
          ) : (
            <ul className="mt-1.5 space-y-1">
              {teachers.map((t, i) => (
                <li key={i} className="text-[13px]">
                  <span className="font-medium text-brand-dark">
                    {t.teacher.user.firstName} {t.teacher.user.lastName}
                  </span>
                  <span className="text-zinc-500">
                    {" "}
                    · {t.teacher.user.email}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) => {
          if (value === "materials" || value === "students") {
            switchTab(value);
          }
        }}
        className="flex min-h-0 flex-1 flex-col gap-0"
      >
        <div className="sticky top-14 z-10 -mx-4 border-b border-border bg-white/95 px-4 pb-2 backdrop-blur supports-[backdrop-filter]:bg-white/90 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <TabsList
            variant="line"
            className="grid h-auto w-full grid-cols-2 gap-0 rounded-none bg-transparent p-0"
          >
            {(
              [
                {
                  value: "students" as const,
                  label: "Students",
                  count: students.length,
                },
                {
                  value: "materials" as const,
                  label: "Materials",
                  count: materials.length,
                },
              ] as const
            ).map((item) => {
              const active = tab === item.value;
              return (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className={cn(
                    "h-9 flex-none justify-center gap-1.5 rounded-none border-0 px-2 py-0 text-[13px] shadow-none sm:h-10",
                    "after:hidden data-active:shadow-none",
                    active
                      ? "!bg-zinc-100 font-semibold !text-ink hover:!bg-zinc-100"
                      : "bg-transparent text-zinc-400 hover:bg-transparent hover:text-zinc-700",
                  )}
                >
                  <span>{item.label}</span>
                  <span className="font-normal tabular-nums text-zinc-400">
                    {item.count}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <div className="mt-5 flex min-h-0 flex-1 flex-col">

        <TabsContent
          value="materials"
          className="flex min-h-0 flex-1 flex-col gap-4 outline-none"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={materialQuery}
                onChange={(e) => setMaterialQuery(e.target.value)}
                placeholder="Search materials…"
                className="h-9 rounded-md border-border bg-transparent pl-9 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="flex min-w-0 flex-1 items-center gap-2 text-[12px] text-muted-foreground sm:flex-none">
                <span className="whitespace-nowrap">Sort</span>
                <select
                  value={materialSort}
                  onChange={(e) =>
                    setMaterialSort(e.target.value as MaterialSort)
                  }
                  className="h-9 w-full rounded-md border border-border bg-white px-2 text-[12px] font-medium text-brand-dark outline-none focus-visible:ring-2 focus-visible:ring-brand/25 sm:h-8 sm:w-auto"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="title">Title A–Z</option>
                </select>
              </label>
              {canUpload && (
                <ButtonLink
                  href={`/classes/${data.id}/materials/new`}
                  size="sm"
                  className="shrink-0"
                >
                  <Plus className="size-3.5" />
                  <span className="sm:inline">Add</span>
                </ButtonLink>
              )}
            </div>
          </div>

          {materials.length === 0 ? (
            <p className="rounded-lg bg-zinc-50 px-3.5 py-5 text-[13px] text-zinc-400">
              No reading materials yet.
              {canUpload ? " Add files for students to download." : ""}
            </p>
          ) : filteredMaterials.length === 0 ? (
            <p className="rounded-lg bg-zinc-50 px-3.5 py-5 text-[13px] text-zinc-400">
              No materials match your search.
            </p>
          ) : (
            <div className="flex flex-1 flex-col gap-4">
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {materialPageItems.map((m) => {
                  const title = materialDisplayTitle(m.title, m.attachment);
                  const meta = `${
                    m.teacher?.user
                      ? `${m.teacher.user.firstName} ${m.teacher.user.lastName} · `
                      : ""
                  }${formatShortDate(m.createdAt)}`;
                  return (
                    <li key={m.id}>
                      <MaterialPreviewCard
                        title={title}
                        description={m.description}
                        attachment={m.attachment}
                        meta={meta}
                        canRemove={canUpload}
                        onRemove={() => setRemoveTarget(m)}
                      />
                    </li>
                  );
                })}
              </ul>

              {filteredMaterials.length > PAGE_SIZE && (
                <ListPagination
                  rangeStart={materialRangeStart}
                  rangeEnd={materialRangeEnd}
                  total={filteredMaterials.length}
                  page={materialCurrentPage}
                  totalPages={materialTotalPages}
                  onPrevious={() =>
                    setMaterialPage((p) => Math.max(1, p - 1))
                  }
                  onNext={() =>
                    setMaterialPage((p) =>
                      Math.min(materialTotalPages, p + 1),
                    )
                  }
                />
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="students"
          className="flex min-h-0 flex-1 flex-col gap-4 outline-none"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={studentQuery}
                onChange={(e) => setStudentQuery(e.target.value)}
                placeholder="Search students…"
                className="h-9 rounded-md border-border bg-transparent pl-9 text-sm"
              />
            </div>
            <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <span className="whitespace-nowrap">Sort</span>
              <select
                value={studentSort}
                onChange={(e) =>
                  setStudentSort(e.target.value as StudentSort)
                }
                className="h-9 w-full rounded-md border border-border bg-white px-2 text-[12px] font-medium text-brand-dark outline-none focus-visible:ring-2 focus-visible:ring-brand/25 sm:h-8 sm:w-auto"
              >
                <option value="name">Name A–Z</option>
                <option value="number">Student no.</option>
                <option value="email">Email A–Z</option>
              </select>
            </label>
          </div>

          {students.length === 0 ? (
            <p className="rounded-lg bg-zinc-50 px-3.5 py-5 text-[13px] text-zinc-400">
              No students yet. Share the class code so they can join.
            </p>
          ) : filteredStudents.length === 0 ? (
            <p className="rounded-lg bg-zinc-50 px-3.5 py-5 text-[13px] text-zinc-400">
              No students match your search.
            </p>
          ) : (
            <div className="flex flex-1 flex-col gap-4">
              <div className="overflow-x-auto rounded-lg">
                <table className="w-full min-w-[560px] text-left">
                  <thead>
                    <tr className="bg-zinc-100 text-[11px] uppercase tracking-[0.08em] text-zinc-500">
                      <th className="px-3.5 py-3 font-medium">Name</th>
                      <th className="px-3.5 py-3 font-medium">Student no.</th>
                      <th className="px-3.5 py-3 font-medium">Email</th>
                      <th className="px-3.5 py-3 font-medium">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentPageItems.map((s, i) => (
                      <tr
                        key={s.student.id ?? i}
                        className={cn(
                          "text-[13px]",
                          i % 2 === 0 ? "bg-white" : "bg-zinc-50",
                        )}
                      >
                        <td className="px-3.5 py-3 font-medium text-brand-dark">
                          {s.student.user.firstName} {s.student.user.lastName}
                        </td>
                        <td className="px-3.5 py-3 font-mono text-[12px] text-zinc-600">
                          {s.student.studentNumber ?? "—"}
                        </td>
                        <td className="px-3.5 py-3 text-zinc-600">
                          {s.student.user.email}
                        </td>
                        <td className="px-3.5 py-3 text-zinc-500">
                          {s.student.user.phoneNumber ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredStudents.length > PAGE_SIZE && (
                <ListPagination
                  rangeStart={studentRangeStart}
                  rangeEnd={studentRangeEnd}
                  total={filteredStudents.length}
                  page={studentCurrentPage}
                  totalPages={studentTotalPages}
                  onPrevious={() =>
                    setStudentPage((p) => Math.max(1, p - 1))
                  }
                  onNext={() =>
                    setStudentPage((p) => Math.min(studentTotalPages, p + 1))
                  }
                />
              )}
            </div>
          )}
        </TabsContent>
        </div>
      </Tabs>

      <Dialog
        open={removeTarget !== null}
        onOpenChange={(open) => {
          if (!open && !removing) setRemoveTarget(null);
        }}
      >
        <DialogContent showCloseButton={!removing}>
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-semibold text-brand-dark">
              Remove reading material?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to proceed with removing{" "}
              <span className="font-semibold text-brand-dark">
                {removeTarget
                  ? materialDisplayTitle(
                      removeTarget.title,
                      removeTarget.attachment,
                    )
                  : ""}
              </span>
              ? Students will no longer be able to open this file.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRemoveTarget(null)}
              disabled={removing}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void onRemoveConfirm()}
              disabled={removing}
            >
              {removing ? "Removing…" : "Proceed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
