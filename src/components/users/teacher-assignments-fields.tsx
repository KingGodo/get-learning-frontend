"use client";

import Link from "next/link";
import type { ClassRoom, Subject } from "@/lib/types";
import { cn } from "@/lib/utils";

export type TeacherAssignmentDraft = {
  subjectId: string;
  classIds: string[];
};

type TeacherAssignmentsFieldsProps = {
  subjects: Subject[];
  classes: ClassRoom[];
  value: TeacherAssignmentDraft[];
  onChange: (next: TeacherAssignmentDraft[]) => void;
  disabled?: boolean;
};

export function TeacherAssignmentsFields({
  subjects,
  classes,
  value,
  onChange,
  disabled,
}: TeacherAssignmentsFieldsProps) {
  const selectedSubjectIds = new Set(value.map((a) => a.subjectId));

  function toggleSubject(subjectId: string) {
    if (selectedSubjectIds.has(subjectId)) {
      onChange(value.filter((a) => a.subjectId !== subjectId));
      return;
    }
    onChange([...value, { subjectId, classIds: [] }]);
  }

  function toggleClass(subjectId: string, classId: string) {
    onChange(
      value.map((a) => {
        if (a.subjectId !== subjectId) return a;
        const has = a.classIds.includes(classId);
        return {
          ...a,
          classIds: has
            ? a.classIds.filter((id) => id !== classId)
            : [...a.classIds, classId],
        };
      }),
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="border border-border bg-muted/40 px-3.5 py-3 text-[13px] text-muted-foreground">
        Add subjects and classes for your school first, then assign them here.{" "}
        <Link href="/subjects/new" className="font-medium text-brand hover:underline">
          Add subject
        </Link>
        {" · "}
        <Link href="/classes/new" className="font-medium text-brand hover:underline">
          Add class
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[13px] font-medium text-foreground">
          Subjects &amp; classes
        </p>
        <p className="mt-0.5 text-[12px] text-muted-foreground">
          Select subjects, then choose which classes this teacher will teach for
          each.
        </p>
      </div>

      <ul className="divide-y divide-border border-y border-border">
        {subjects.map((subject) => {
          const selected = selectedSubjectIds.has(subject.id);
          const assignment = value.find((a) => a.subjectId === subject.id);
          const subjectClasses = classes.filter(
            (c) => c.subjectId === subject.id || c.subject?.id === subject.id,
          );

          return (
            <li key={subject.id} className="py-3.5">
              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 rounded border-border"
                  checked={selected}
                  disabled={disabled}
                  onChange={() => toggleSubject(subject.id)}
                />
                <span>
                  <span className="block text-[13px] font-medium text-foreground">
                    {subject.name}
                  </span>
                  <span className="font-mono text-[12px] text-muted-foreground">
                    {subject.code}
                  </span>
                </span>
              </label>

              {selected && (
                <div className="mt-3 ml-6 space-y-2">
                  {subjectClasses.length === 0 ? (
                    <p className="text-[12px] text-muted-foreground">
                      No classes for this subject yet.{" "}
                      <Link
                        href="/classes/new"
                        className="font-medium text-brand hover:underline"
                      >
                        Create a class
                      </Link>
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {subjectClasses.map((cls) => {
                        const checked =
                          assignment?.classIds.includes(cls.id) ?? false;
                        return (
                          <label
                            key={cls.id}
                            className={cn(
                              "inline-flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-[12px] transition-colors",
                              checked
                                ? "border-brand bg-brand-light text-foreground"
                                : "border-border bg-white text-muted-foreground hover:border-brand/40",
                            )}
                          >
                            <input
                              type="checkbox"
                              className="size-3.5 rounded border-border"
                              checked={checked}
                              disabled={disabled}
                              onChange={() =>
                                toggleClass(subject.id, cls.id)
                              }
                            />
                            {cls.name}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function assignmentsAreValid(value: TeacherAssignmentDraft[]) {
  return (
    value.length > 0 && value.every((a) => a.classIds.length > 0)
  );
}
