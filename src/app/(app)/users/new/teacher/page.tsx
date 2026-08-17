"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GenderSelect } from "@/components/auth/registration-fields";
import { useAuth } from "@/components/providers/auth-provider";
import { CredentialsPanel } from "@/components/users/credentials-panel";
import {
  TeacherAssignmentsFields,
  assignmentsAreValid,
  type TeacherAssignmentDraft,
} from "@/components/users/teacher-assignments-fields";
import { classesApi, subjectsApi, usersApi } from "@/lib/api";
import { toast, toastFromError } from "@/lib/toast";
import type { ClassRoom, IssuedCredentials, Subject } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageLoading } from "@/components/ui/page-loading";

type CreatedTeacher = {
  name: string;
  credentials: IssuedCredentials;
  userId: string;
};

const DEPARTMENT_OPTIONS = [
  "Mathematics",
  "English Language",
  "Literature in English",
  "Integrated Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Geography",
  "History",
  "Heritage Studies",
  "Family and Religious Studies",
  "Agriculture",
  "Agricultural Science",
  "Computer Science",
  "Information and Communication Technology",
  "Design and Technology",
  "Technical Graphics",
  "Wood Technology",
  "Metal Technology",
  "Building Studies",
  "Home Economics",
  "Food and Nutrition",
  "Fashion and Fabrics",
  "Commerce",
  "Accounts",
  "Business Studies",
  "Economics",
  "Shona",
  "Ndebele",
  "French",
  "Art and Design",
  "Music",
  "Physical Education",
  "Guidance and Counselling",
  "Special Needs Education",
  "Early Childhood Development",
  "Primary Education",
  "Secondary Education",
  "Examination Department",
  "Student Affairs",
  "Dean of Studies",
  "Library and Media",
  "Discipline",
  "Boarding",
  "Administration",
];

const QUALIFICATION_OPTIONS = [
  "Diploma in Education",
  "Diploma in Primary Education",
  "Diploma in Secondary Education",
  "Diploma in Early Childhood Development",
  "Higher National Diploma in Education",
  "Bachelor of Education (B.Ed)",
  "B.Ed (Primary)",
  "B.Ed (Secondary)",
  "B.Ed (Science)",
  "Bachelor of Arts",
  "Bachelor of Science",
  "Bachelor of Technology Education",
  "Bachelor of Commerce",
  "Bachelor of Social Science",
  "Postgraduate Diploma in Education (PGDE)",
  "Graduate Diploma in Education",
  "Master of Education (M.Ed)",
  "Master of Science in Education",
  "Master of Arts in Education",
  "Master in Curriculum Studies",
  "Master in Educational Leadership",
  "Doctor of Philosophy (PhD) Education",
  "Certificate in Education",
  "Certificate in ECD",
  "Special Needs Education Certification",
  "Teaching English as a Foreign Language (TEFL)",
  "Cambridge International Certificate in Teaching",
  "Computer Literacy Certification",
  "First Aid Certification",
  "School Leadership Certification",
  "Teacher Registration Certificate",
];

export default function NewTeacherPage() {
  const { user } = useAuth();
  const router = useRouter();
  const canCreate =
    user?.role === "SCHOOL_ADMIN" || user?.role === "ADMIN";
  const [checking, setChecking] = useState(true);
  const [pending, setPending] = useState(false);
  const [created, setCreated] = useState<CreatedTeacher | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignmentDraft[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    gender: "PREFER_NOT_TO_SAY",
    password: "",
    department: "",
    qualification: "",
  });

  useEffect(() => {
    if (!user) return;
    if (!canCreate) {
      router.replace("/dashboard");
      return;
    }
    if (user.role === "ADMIN") {
      router.replace("/users");
      return;
    }
    setChecking(false);

    let cancelled = false;
    async function loadCatalog() {
      setCatalogLoading(true);
      try {
        const [subjectRows, classRows] = await Promise.all([
          subjectsApi.list(),
          classesApi.list(),
        ]);
        if (cancelled) return;
        setSubjects(subjectRows);
        setClasses(classRows);
      } catch {
        if (!cancelled) {
          setSubjects([]);
          setClasses([]);
        }
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    }
    void loadCatalog();
    return () => {
      cancelled = true;
    };
  }, [user, canCreate, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!assignmentsAreValid(assignments)) {
      toast.error(
        "Select at least one subject and at least one class for each selected subject.",
      );
      return;
    }
    setPending(true);
    try {
      const data = await usersApi.createTeacher({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        gender: form.gender,
        password: form.password,
        department: form.department || undefined,
        qualification: form.qualification || undefined,
        assignments,
      });
      setCreated({
        name: `${data.user.firstName} ${data.user.lastName}`,
        credentials: data.credentials,
        userId: data.user.id,
      });
      setPending(false);
    } catch (err) {
      toastFromError(err, "Could not create teacher");
      setPending(false);
    }
  }

  if (!user || checking || catalogLoading) {
    return <PageLoading label="Loading…" />;
  }

  if (created) {
    return (
      <div className="relative mx-auto max-w-xl space-y-8">
        <PageHeader
          eyebrow="Teacher created"
          title={created.name}
          description="Share these credentials so they can sign in."
        />
        <CredentialsPanel
          credentials={created.credentials}
          footer={
            <div className="flex flex-wrap gap-2">
              <ButtonLink href={`/users/${created.userId}`} size="sm">
                View profile
              </ButtonLink>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setCreated(null);
                  setAssignments([]);
                  setForm({
                    firstName: "",
                    lastName: "",
                    email: "",
                    phoneNumber: "",
                    gender: "PREFER_NOT_TO_SAY",
                    password: "",
                    department: "",
                    qualification: "",
                  });
                }}
              >
                Add another
              </Button>
              <Link
                href="/users"
                className="inline-flex h-9 items-center px-4 text-sm font-medium text-zinc-500 hover:text-brand-dark"
              >
                Back to people
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-xl space-y-8">
      {pending && <PageLoading overlay label="Creating teacher…" />}
      <div>
        <Link
          href="/users"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-500 transition-colors hover:text-brand-dark"
        >
          <ArrowLeft className="size-3.5" />
          Back to people
        </Link>
        <PageHeader
          title="Add teacher"
          description="Creates an account for your school, assigns subjects and classes, and issues a temporary password."
          className="mt-4 pb-0"
        />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className="text-[13px] text-zinc-600">
              First name
            </Label>
            <Input
              id="firstName"
              required
              value={form.firstName}
              onChange={(e) =>
                setForm((f) => ({ ...f, firstName: e.target.value }))
              }
              className="h-9 rounded-md bg-transparent"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName" className="text-[13px] text-zinc-600">
              Last name
            </Label>
            <Input
              id="lastName"
              required
              value={form.lastName}
              onChange={(e) =>
                setForm((f) => ({ ...f, lastName: e.target.value }))
              }
              className="h-9 rounded-md bg-transparent"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[13px] text-zinc-600">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="h-9 rounded-md bg-transparent"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-[13px] text-zinc-600">
              Phone
            </Label>
            <Input
              id="phone"
              required
              value={form.phoneNumber}
              onChange={(e) =>
                setForm((f) => ({ ...f, phoneNumber: e.target.value }))
              }
              className="h-9 rounded-md bg-transparent"
              placeholder="+263…"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="password" className="text-[13px] text-zinc-600">
              One-time password
            </Label>
            <Input
              id="password"
              type="text"
              required
              minLength={8}
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              className="h-9 rounded-md bg-transparent font-mono"
              placeholder="Set a temporary password"
            />
            <p className="text-[12px] text-zinc-500">
              This will be shared with the teacher for first login.
            </p>
          </div>
        </div>

        <GenderSelect
          value={form.gender}
          onChange={(value) => setForm((f) => ({ ...f, gender: value }))}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="department" className="text-[13px] text-zinc-600">
              Department
            </Label>
            <Input
              id="department"
              list="department-options"
              value={form.department}
              onChange={(e) =>
                setForm((f) => ({ ...f, department: e.target.value }))
              }
              className="h-9 rounded-md bg-transparent"
              placeholder="Type to search department"
            />
            <datalist id="department-options">
              {DEPARTMENT_OPTIONS.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qualification" className="text-[13px] text-zinc-600">
              Qualification
            </Label>
            <Input
              id="qualification"
              list="qualification-options"
              value={form.qualification}
              onChange={(e) =>
                setForm((f) => ({ ...f, qualification: e.target.value }))
              }
              className="h-9 rounded-md bg-transparent"
              placeholder="Type to search qualification"
            />
            <datalist id="qualification-options">
              {QUALIFICATION_OPTIONS.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>
        </div>

        <TeacherAssignmentsFields
          subjects={subjects}
          classes={classes}
          value={assignments}
          onChange={setAssignments}
          disabled={pending}
        />

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            type="submit"
            disabled={pending || !assignmentsAreValid(assignments)}
            size="sm"
          >
            {pending ? "Creating…" : "Create teacher"}
          </Button>
          <ButtonLink href="/users" variant="outline" size="sm">
            Cancel
          </ButtonLink>
        </div>
      </form>
    </div>
  );
}
