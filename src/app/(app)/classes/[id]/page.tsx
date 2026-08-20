"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Copy,
  Plus,
  Search,
  Users,
} from "lucide-react";
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
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { ListPagination } from "@/components/ui/list-pagination";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoading } from "@/components/ui/page-loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatStrip } from "@/components/ui/stat-strip";
import { StatusBadge, statusToneFor } from "@/components/ui/status-badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

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

function classInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function studentInitials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
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
  const canUpload =
    user?.role === "TEACHER" ||
    user?.role === "ADMIN" ||
    user?.role === "SCHOOL_ADMIN";

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
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-3.5" strokeWidth={1.75} />
          Classes
        </Link>
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
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
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-3.5" strokeWidth={1.75} />
          Classes
        </Link>

        <div className="mt-4 flex flex-wrap items-start gap-4 border-b border-border pb-6">
          <span
            className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand-light text-[14px] font-semibold text-brand"
            aria-hidden
          >
            {classInitials(data.name)}
          </span>
          <div className="min-w-0 flex-1">
            <PageHeader
              eyebrow={data.subject?.name ?? "Class"}
              title={data.name}
              description={data.description ?? undefined}
              className="border-b-0 pb-0"
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
                        <Check className="size-3.5 text-brand" />
                      ) : (
                        <Copy className="size-3.5 text-muted-foreground" />
                      )}
                      <span className="font-sans text-[11px] font-medium text-muted-foreground">
                        {copied ? "Copied" : "Copy"}
                      </span>
                    </span>
                  </Button>
                  {canUpload && (
                    <>
                      <ButtonLink
                        href={`/assignments/new?classId=${data.id}`}
                        size="sm"
                      >
                        New assignment
                      </ButtonLink>
                      <ButtonLink
                        href={`/classes/${data.id}/materials/new`}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="size-3.5" />
                        Add material
                      </ButtonLink>
                    </>
                  )}
                </div>
              }
            />

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge tone={statusToneFor(data.status)}>
                {data.status.charAt(0) + data.status.slice(1).toLowerCase()}
              </StatusBadge>
              <span className="inline-flex rounded-md border border-border bg-background px-2 py-1 font-mono text-[11px] font-medium text-ink tabular-nums">
                {data.academicYear} · S{data.semester}
              </span>
              {data.subject && (
                <Link
                  href={`/subjects/${data.subject.id}`}
                  className="text-[12px] font-medium text-brand hover:underline"
                >
                  View subject
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <StatStrip
        items={[
          { label: "Students", value: students.length },
          { label: "Materials", value: materials.length },
          { label: "Teachers", value: teachers.length },
        ]}
      />

      {teachers.length > 0 && (
        <section className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="border-b border-border bg-muted/40 px-5 py-2.5">
            <h2 className="text-[11px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
              Class teacher{teachers.length === 1 ? "" : "s"}
            </h2>
          </div>
          <ul>
            {teachers.map((t, i) => (
              <li
                key={i}
                className="flex items-center gap-3 border-t border-border px-5 py-3 first:border-t-0"
              >
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-semibold text-slate-600"
                  aria-hidden
                >
                  {studentInitials(
                    t.teacher.user.firstName,
                    t.teacher.user.lastName,
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-ink">
                    {t.teacher.user.firstName} {t.teacher.user.lastName}
                  </p>
                  <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                    {t.teacher.user.email}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Tabs
        value={tab}
        onValueChange={(value) => {
          if (value === "materials" || value === "students") {
            switchTab(value);
          }
        }}
        className="flex min-h-0 flex-1 flex-col gap-4"
      >
        <div className="sticky top-14 z-10 -mx-4 border-b border-border bg-background/90 px-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
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
                  icon: Users,
                },
                {
                  value: "materials" as const,
                  label: "Materials",
                  count: materials.length,
                  icon: BookOpen,
                },
              ] as const
            ).map((item) => {
              const active = tab === item.value;
              const Icon = item.icon;
              return (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className={cn(
                    "h-10 flex-none justify-center gap-2 rounded-none border-0 px-2 py-0 text-[13px] shadow-none",
                    "after:hidden data-active:shadow-none",
                    active
                      ? "!bg-muted font-semibold !text-ink"
                      : "bg-transparent text-muted-foreground hover:bg-transparent hover:text-ink",
                  )}
                >
                  <Icon className="size-3.5" strokeWidth={1.75} />
                  <span>{item.label}</span>
                  <span className="rounded-md bg-background px-1.5 py-0.5 font-mono text-[11px] font-medium text-muted-foreground tabular-nums">
                    {item.count}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <TabsContent
          value="students"
          className="flex min-h-0 flex-1 flex-col gap-4 outline-none"
        >
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:p-3.5">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={studentQuery}
                onChange={(e) => setStudentQuery(e.target.value)}
                placeholder="Search students…"
                className="h-9 rounded-md border-border bg-background pl-9 text-sm shadow-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-muted-foreground">
                Sort
              </span>
              <Select
                value={studentSort}
                onValueChange={(value) => {
                  if (
                    value === "name" ||
                    value === "number" ||
                    value === "email"
                  ) {
                    setStudentSort(value);
                  }
                }}
              >
                <SelectTrigger className="h-9 w-[140px] rounded-md border-border bg-background text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name A–Z</SelectItem>
                  <SelectItem value="number">Student no.</SelectItem>
                  <SelectItem value="email">Email A–Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {students.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card">
              <EmptyState
                title="No students yet"
                description="Share the class code so students can join."
              />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="rounded-lg border border-border bg-card">
              <EmptyState
                title="No matches"
                description="No students match your search."
              />
            </div>
          ) : (
            <div className="flex flex-1 flex-col gap-4">
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] table-fixed border-collapse text-left">
                    <colgroup>
                      <col className="w-[28%]" />
                      <col className="w-[16%]" />
                      <col className="w-[32%]" />
                      <col className="w-[24%]" />
                    </colgroup>
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-[11px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
                        <th className="px-5 py-2.5 font-medium">Name</th>
                        <th className="px-5 py-2.5 font-medium">Student no.</th>
                        <th className="px-5 py-2.5 font-medium">Email</th>
                        <th className="px-5 py-2.5 font-medium">Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentPageItems.map((s, i) => (
                        <tr
                          key={s.student.id ?? i}
                          className="border-b border-border last:border-b-0 transition-colors duration-150 ease-craft hover:bg-muted/40"
                        >
                          <td className="px-5 py-3.5 align-middle">
                            <div className="flex min-w-0 items-center gap-3">
                              <span
                                className="flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-light text-[11px] font-semibold text-brand"
                                aria-hidden
                              >
                                {studentInitials(
                                  s.student.user.firstName,
                                  s.student.user.lastName,
                                )}
                              </span>
                              <span className="truncate text-[14px] font-semibold tracking-tight text-ink">
                                {s.student.user.firstName}{" "}
                                {s.student.user.lastName}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 align-middle font-mono text-[12px] text-ink tabular-nums">
                            {s.student.studentNumber ?? "—"}
                          </td>
                          <td className="px-5 py-3.5 align-middle">
                            <span className="block truncate text-[13px] text-slate-600">
                              {s.student.user.email}
                            </span>
                          </td>
                          <td
                            className={cn(
                              "px-5 py-3.5 align-middle text-[13px]",
                              s.student.user.phoneNumber
                                ? "font-mono text-slate-600 tabular-nums"
                                : "text-muted-foreground",
                            )}
                          >
                            {s.student.user.phoneNumber ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <ListPagination
                rangeStart={studentRangeStart}
                rangeEnd={studentRangeEnd}
                total={filteredStudents.length}
                page={studentCurrentPage}
                totalPages={studentTotalPages}
                onPrevious={() => setStudentPage((p) => Math.max(1, p - 1))}
                onNext={() =>
                  setStudentPage((p) => Math.min(studentTotalPages, p + 1))
                }
              />
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="materials"
          className="flex min-h-0 flex-1 flex-col gap-4 outline-none"
        >
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:p-3.5">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={materialQuery}
                onChange={(e) => setMaterialQuery(e.target.value)}
                placeholder="Search materials…"
                className="h-9 rounded-md border-border bg-background pl-9 text-sm shadow-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-muted-foreground">
                Sort
              </span>
              <Select
                value={materialSort}
                onValueChange={(value) => {
                  if (
                    value === "newest" ||
                    value === "oldest" ||
                    value === "title"
                  ) {
                    setMaterialSort(value);
                  }
                }}
              >
                <SelectTrigger className="h-9 w-[130px] rounded-md border-border bg-background text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="title">Title A–Z</SelectItem>
                </SelectContent>
              </Select>
              {canUpload && (
                <ButtonLink
                  href={`/classes/${data.id}/materials/new`}
                  size="sm"
                  className="shrink-0"
                >
                  <Plus className="size-3.5" />
                  Add
                </ButtonLink>
              )}
            </div>
          </div>

          {materials.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card">
              <EmptyState
                title="No reading materials yet"
                description={
                  canUpload
                    ? "Add files for students to preview and download."
                    : "Your teacher has not added materials for this class yet."
                }
                action={
                  canUpload ? (
                    <ButtonLink
                      href={`/classes/${data.id}/materials/new`}
                      size="sm"
                    >
                      <Plus className="size-3.5" />
                      Add material
                    </ButtonLink>
                  ) : undefined
                }
              />
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="rounded-lg border border-border bg-card">
              <EmptyState
                title="No matches"
                description="No materials match your search."
              />
            </div>
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

              <ListPagination
                rangeStart={materialRangeStart}
                rangeEnd={materialRangeEnd}
                total={filteredMaterials.length}
                page={materialCurrentPage}
                totalPages={materialTotalPages}
                onPrevious={() => setMaterialPage((p) => Math.max(1, p - 1))}
                onNext={() =>
                  setMaterialPage((p) => Math.min(materialTotalPages, p + 1))
                }
              />
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={removeTarget !== null}
        onOpenChange={(open) => {
          if (!open && !removing) setRemoveTarget(null);
        }}
      >
        <DialogContent showCloseButton={!removing}>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-ink">
              Remove reading material?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-semibold text-ink">
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
