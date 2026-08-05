"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Upload } from "lucide-react";
import { AttachmentActions } from "@/components/files/attachment-actions";
import { useAuth } from "@/components/providers/auth-provider";
import {
  ApiRequestError,
  assignmentsApi,
  submissionsApi,
} from "@/lib/api";
import { toast, toastFromError } from "@/lib/toast";
import type { Assignment, Submission } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CenterSuccessToast } from "@/components/ui/center-success-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { StatusBadge, statusToneFor } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

export default function AssignmentDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const isStudent = user?.role === "STUDENT";
  const [data, setData] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [gradedToast, setGradedToast] = useState(false);

  async function load() {
    try {
      const assignment = await assignmentsApi.get(params.id);
      setData(assignment);
      if (isStudent) {
        setSubmissions(await submissionsApi.list(params.id));
      } else {
        setSubmissions(
          (assignment.submissions as Submission[] | undefined) ?? [],
        );
      }
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Not found");
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, isStudent]);

  useEffect(() => {
    if (!submissions.length) return;
    const hash = window.location.hash.replace("#", "");
    if (!hash.startsWith("submission-")) return;
    const el = document.getElementById(hash);
    if (el) {
      window.requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }, [submissions]);

  async function submitWork(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      toast.error("Choose a PDF or Word file to upload");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("assignmentId", params.id);
      fd.append("attachment", file);
      await submissionsApi.submit(fd);
      setFile(null);
      await load();
    } catch (err) {
      toastFromError(err, "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function grade(
    submissionId: string,
    score: number,
    feedback: string,
  ): Promise<boolean> {
    try {
      await submissionsApi.grade(submissionId, {
        score,
        feedback: feedback || undefined,
      });
      setGradedToast(true);
      await load();
      return true;
    } catch (err) {
      toastFromError(err, "Grade failed");
      return false;
    }
  }

  if (error && !data) {
    return (
      <div
        className="border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700"
        role="alert"
      >
        {error}
      </div>
    );
  }
  if (!data) {
    return <PageLoading label="Loading assignment…" />;
  }

  const mySubmission = isStudent ? submissions[0] : undefined;
  const due = new Date(data.dueDate);
  const isOverdue = due.getTime() < Date.now() && data.status === "PUBLISHED";
  const canSubmit =
    isStudent &&
    data.status === "PUBLISHED" &&
    (data.allowLateSubmission || !isOverdue || !!mySubmission);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <CenterSuccessToast
        message="Graded"
        open={gradedToast}
        onClose={() => setGradedToast(false)}
      />
      <div>
        <Link
          href="/assignments"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-500 transition-colors hover:text-brand-dark"
        >
          <ArrowLeft className="size-3.5" />
          Back to assignments
        </Link>

        <PageHeader
          eyebrow="Assignment"
          title={data.title}
          className="mt-4 pb-0"
          actions={
            <StatusBadge tone={statusToneFor(data.status)}>
              {data.status.charAt(0) + data.status.slice(1).toLowerCase()}
            </StatusBadge>
          }
        />

        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted-foreground">
          <span>
            Due{" "}
            <span
              className={cn(
                "font-medium",
                isOverdue ? "text-red-600" : "text-brand-dark",
              )}
            >
              {due.toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
            {isOverdue && " · overdue"}
          </span>
          <span>
            <span className="font-medium text-brand-dark">{data.totalMarks}</span>{" "}
            marks
          </span>
          {data.class?.name && <span>{data.class.name}</span>}
        </div>

        {isStudent && (
          <p className="mt-4 border border-border bg-zinc-50 px-3.5 py-3 text-[13px] leading-relaxed text-zinc-600">
            <span className="font-semibold text-brand-dark">What to do: </span>
            Read the brief below
            {data.attachment
              ? ", preview or download the teacher’s file"
              : ""}
            , then upload your finished PDF or Word document.
          </p>
        )}
      </div>

      <section className="space-y-4 border-y border-border py-6">
        <h2 className="text-[12px] font-medium text-muted-foreground">Brief</h2>
        <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-zinc-700">
          {data.description}
        </p>
        {data.instructions && (
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
              Instructions
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-zinc-700">
              {data.instructions}
            </p>
          </div>
        )}
      </section>

      {data.attachment ? (
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-brand-dark">
              Teacher’s file
            </h2>
            <p className="mt-0.5 text-[12px] text-zinc-400">
              Preview opens in a new tab. Download saves a copy to your device.
            </p>
          </div>
          <AttachmentActions
            pathOrUrl={data.attachment}
            title="Assignment attachment"
          />
        </section>
      ) : (
        isStudent && (
          <p className="text-[13px] text-zinc-500">
            No file attached — follow the brief and instructions above.
          </p>
        )
      )}

      {isStudent && mySubmission && (
        <section className="space-y-3 border border-emerald-200/80 bg-emerald-50/40 px-4 py-4">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            <div>
              <h2 className="text-sm font-semibold text-brand-dark">
                Your submission
              </h2>
              <p className="mt-0.5 text-[13px] text-zinc-600">
                Status:{" "}
                <StatusBadge tone={statusToneFor(mySubmission.status)}>
                  {mySubmission.status.charAt(0) +
                    mySubmission.status.slice(1).toLowerCase()}
                </StatusBadge>
                {mySubmission.score != null && (
                  <>
                    {" "}
                    · Score{" "}
                    <span className="font-medium text-brand-dark">
                      {mySubmission.score}/{data.totalMarks}
                    </span>
                  </>
                )}
                {" · "}
                {new Date(mySubmission.submittedAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
              {mySubmission.feedback && (
                <p className="mt-2 text-[13px] leading-relaxed text-zinc-700">
                  Feedback: {mySubmission.feedback}
                </p>
              )}
            </div>
          </div>
          {mySubmission.attachment && (
            <AttachmentActions
              pathOrUrl={mySubmission.attachment}
              title="Your uploaded file"
              size="sm"
            />
          )}
        </section>
      )}

      {canSubmit && (
        <section className="space-y-3 border border-border px-4 py-5">
          <div className="flex items-start gap-2.5">
            <Upload className="mt-0.5 size-4 shrink-0 text-brand-dark" />
            <div>
              <h2 className="text-sm font-semibold text-brand-dark">
                {mySubmission ? "Replace your work" : "Submit your work"}
              </h2>
              <p className="mt-0.5 text-[12px] text-zinc-400">
                Upload a PDF or Word document (.pdf, .doc, .docx)
              </p>
            </div>
          </div>

          <form onSubmit={submitWork} className="relative space-y-3.5 pt-1">
            {submitting && <PageLoading overlay label="Uploading…" />}
            <div className="space-y-1.5">
              <Label htmlFor="submission" className="text-[13px] text-zinc-600">
                Choose file
              </Label>
              <Input
                id="submission"
                type="file"
                accept=".pdf,.doc,.docx"
                required
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="h-10 rounded-md border-border bg-white"
              />
              {file && (
                <p className="text-[12px] text-zinc-500">
                  Selected: {file.name}
                </p>
              )}
            </div>
            <Button type="submit" disabled={submitting} size="sm">
              {submitting
                ? "Uploading…"
                : mySubmission
                  ? "Replace submission"
                  : "Submit assignment"}
            </Button>
          </form>
        </section>
      )}

      {isStudent && data.status === "PUBLISHED" && isOverdue && !data.allowLateSubmission && !mySubmission && (
        <p className="border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700">
          This assignment is past due and late submissions are not allowed.
        </p>
      )}

      {!isStudent && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-brand-dark">
            Submissions ({submissions.length})
          </h2>
          {submissions.length === 0 ? (
            <p className="border border-dashed border-border px-4 py-10 text-center text-[13px] text-zinc-500">
              No submissions yet.
            </p>
          ) : (
            <ul className="space-y-4">
              {submissions.map((s) => (
                <GradeRow
                  key={s.id}
                  submission={s}
                  totalMarks={data.totalMarks}
                  onGrade={grade}
                />
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

function GradeRow({
  submission,
  totalMarks,
  onGrade,
}: {
  submission: Submission;
  totalMarks: number;
  onGrade: (
    id: string,
    score: number,
    feedback: string,
  ) => Promise<boolean>;
}) {
  const [score, setScore] = useState(
    submission.score != null ? String(submission.score) : "",
  );
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [pending, setPending] = useState(false);

  return (
    <li
      id={`submission-${submission.id}`}
      className="scroll-mt-24 border border-border px-4 py-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-brand-dark">
            {submission.student
              ? `${submission.student.user.firstName} ${submission.student.user.lastName}`
              : "Student"}
          </p>
          <p className="mt-0.5 text-[12px] text-zinc-500">
            <StatusBadge tone={statusToneFor(submission.status)}>
              {submission.status.charAt(0) +
                submission.status.slice(1).toLowerCase()}
            </StatusBadge>
            {" · "}
            {new Date(submission.submittedAt).toLocaleString()}
          </p>
        </div>
      </div>

      {submission.attachment && (
        <div className="mt-3">
          <AttachmentActions
            pathOrUrl={submission.attachment}
            title="Student file"
            size="sm"
          />
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-[120px_1fr_auto]">
        <div className="space-y-1.5">
          <Label className="text-[13px] text-zinc-600">
            Score / {totalMarks}
          </Label>
          <Input
            type="number"
            min={0}
            max={totalMarks}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="h-9 rounded-md"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[13px] text-zinc-600">Feedback</Label>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-9 rounded-md"
            rows={2}
          />
        </div>
        <div className="flex items-end">
          <Button
            size="sm"
            disabled={pending || score === ""}
            onClick={async () => {
              setPending(true);
              const ok = await onGrade(
                submission.id,
                Number(score),
                feedback,
              );
              if (ok) {
                setScore("");
                setFeedback("");
              }
              setPending(false);
            }}
          >
            {pending ? "Saving…" : "Grade"}
          </Button>
        </div>
      </div>
    </li>
  );
}
