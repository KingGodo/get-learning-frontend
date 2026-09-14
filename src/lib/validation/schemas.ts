import { z } from "zod";

export const genderSchema = z.enum([
  "MALE",
  "FEMALE",
  "OTHER",
  "PREFER_NOT_TO_SAY",
]);

export const phoneSchema = z
  .string()
  .trim()
  .min(7, "Phone number must be at least 7 characters")
  .max(20, "Phone number must be at most 20 characters");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters");

export const optionalPasswordSchema = z.preprocess((val) => {
  if (typeof val !== "string") return val;
  const trimmed = val.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}, passwordSchema.optional());

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .pipe(z.email("Enter a valid email address"));

const optionalUrl = z.preprocess((val) => {
  if (typeof val !== "string") return val;
  const trimmed = val.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}, z.url("Enter a valid website URL").optional());

export const personFieldsSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  middleName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  email: emailSchema,
  phoneNumber: phoneSchema,
  gender: genderSchema,
  password: optionalPasswordSchema,
});

export const teacherAssignmentSchema = z.object({
  subjectId: z.string().trim().min(1, "Subject is required"),
  classIds: z
    .array(z.string().trim().min(1))
    .min(1, "Select at least one class for each subject"),
});

export const createTeacherSchema = personFieldsSchema.extend({
  department: z.string().trim().max(100).optional(),
  qualification: z.string().trim().max(200).optional(),
  assignments: z
    .array(teacherAssignmentSchema)
    .min(1, "Assign at least one subject with classes"),
});

export const createStudentSchema = personFieldsSchema.extend({
  dateOfBirth: z.string().optional(),
  guardianName: z
    .string()
    .trim()
    .min(1, "Guardian name is required")
    .max(150),
  guardianPhone: phoneSchema,
  guardianEmail: z.preprocess((val) => {
    if (typeof val !== "string") return val;
    const trimmed = val.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }, emailSchema.optional()),
  emergencyContact: z.string().trim().max(150).optional(),
});

export const createHeadmasterSchema = personFieldsSchema;

export const createParentSchema = personFieldsSchema.extend({
  studentIds: z
    .array(z.string().trim().min(1))
    .min(1, "Link at least one student"),
});

export const updateUserSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  middleName: z.string().trim().max(100).optional().nullable(),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  email: emailSchema,
  phoneNumber: phoneSchema,
  gender: genderSchema,
  department: z.string().trim().max(100).optional().nullable(),
  qualification: z.string().trim().max(200).optional().nullable(),
  assignments: z.array(teacherAssignmentSchema).min(1).optional(),
  guardianName: z.string().trim().min(1).max(150).optional(),
  guardianPhone: phoneSchema.optional(),
  guardianEmail: z.preprocess((val) => {
    if (typeof val !== "string") return val;
    const trimmed = val.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }, emailSchema.optional().nullable()),
  emergencyContact: z.string().trim().max(150).optional().nullable(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1, "Reset token is required"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

export const changeEmailSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  email: emailSchema,
});

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  middleName: z.string().trim().max(100).optional().nullable(),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  phoneNumber: phoneSchema,
  gender: genderSchema.optional(),
  dateOfBirth: z.string().optional().nullable(),
  department: z.string().trim().max(100).optional().nullable(),
  qualification: z.string().trim().max(200).optional().nullable(),
  bio: z.string().trim().max(1000).optional().nullable(),
  guardianName: z.string().trim().min(1).max(150).optional(),
  guardianPhone: phoneSchema.optional(),
  guardianEmail: z.preprocess((val) => {
    if (typeof val !== "string") return val;
    const trimmed = val.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }, emailSchema.optional().nullable()),
  emergencyContact: z.string().trim().max(150).optional().nullable(),
});

export const createSchoolSchema = z.object({
  name: z.string().trim().min(2, "School name is required").max(200),
  email: emailSchema,
  phoneNumber: phoneSchema,
  website: optionalUrl,
  address: z.string().trim().min(2, "Address is required").max(300),
  city: z.string().trim().min(2, "City is required").max(100),
  province: z.string().trim().min(2, "Province is required").max(100),
  country: z.string().trim().min(2).max(100).optional(),
  termSystem: z.enum(["TERM", "SEMESTER", "QUARTER"]).optional(),
  termsPerYear: z.coerce.number().int().min(1).max(4).optional(),
  admin: z.object({
    firstName: z.string().trim().min(1, "First name is required").max(100),
    lastName: z.string().trim().min(1, "Last name is required").max(100),
    email: emailSchema,
    phoneNumber: phoneSchema,
    gender: genderSchema,
    password: optionalPasswordSchema,
  }),
});

export const updateSchoolSchema = z.object({
  name: z.string().trim().min(2, "School name is required").max(200),
  email: emailSchema,
  phoneNumber: phoneSchema.optional().or(z.literal("")),
  website: optionalUrl.nullable(),
  address: z.string().trim().max(300).optional(),
  city: z.string().trim().min(2, "City is required").max(100),
  province: z.string().trim().min(2, "Province is required").max(100),
  country: z.string().trim().min(2).max(100).optional(),
  termSystem: z.enum(["TERM", "SEMESTER", "QUARTER"]).optional(),
  termsPerYear: z.coerce.number().int().min(1).max(4).optional(),
});

export const createClassSchema = z.object({
  subjectId: z.string().min(1, "Select a subject"),
  name: z.string().trim().min(1, "Class name is required").max(150),
  description: z.string().trim().max(1000).optional(),
  academicYear: z.coerce
    .number()
    .int("Academic year must be a whole number")
    .min(2000, "Academic year must be 2000 or later")
    .max(2100, "Academic year must be 2100 or earlier"),
  semester: z.coerce
    .number()
    .int()
    .min(1, "Term must be between 1 and 4")
    .max(4, "Term must be between 1 and 4"),
});

export const joinClassSchema = z.object({
  classCode: z
    .string()
    .trim()
    .min(4, "Class code must be at least 4 characters")
    .max(16, "Class code must be at most 16 characters"),
});

export const createSubjectSchema = z.object({
  name: z.string().trim().min(1, "Subject name is required").max(150),
  code: z.string().trim().min(1, "Subject code is required").max(32),
  description: z.string().trim().max(1000).optional(),
});

export const createAssignmentFormSchema = z.object({
  classId: z.string().min(1, "Select a class"),
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().min(1, "Description is required").max(5000),
  instructions: z.string().trim().max(5000).optional(),
  dueDate: z.string().trim().min(1, "Choose a due date"),
  totalMarks: z.coerce
    .number()
    .int("Total marks must be a whole number")
    .positive("Total marks must be greater than 0"),
  allowLateSubmission: z.boolean().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]).optional(),
});

export function gradeScoreSchema(totalMarks: number) {
  return z.object({
    score: z.coerce
      .number()
      .int("Score must be a whole number")
      .min(0, "Score cannot be negative")
      .max(totalMarks, `Score cannot exceed ${totalMarks}`),
    feedback: z.string().trim().max(5000).optional(),
  });
}

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ALLOWED_DOC_EXTENSIONS = [".pdf", ".doc", ".docx"] as const;

export function validateDocumentFile(file: File | null | undefined): string | null {
  if (!file) return "Choose a file";
  if (file.size > MAX_UPLOAD_BYTES) {
    return "File must be 10 MB or smaller";
  }
  const name = file.name.toLowerCase();
  const ok = ALLOWED_DOC_EXTENSIONS.some((ext) => name.endsWith(ext));
  if (!ok) return "Upload a PDF or Word document (.pdf, .doc, .docx)";
  return null;
}

export function validateDocumentFiles(files: File[]): string | null {
  if (files.length === 0) return "Choose at least one file";
  for (const file of files) {
    const err = validateDocumentFile(file);
    if (err && err !== "Choose a file") return `${file.name}: ${err}`;
  }
  return null;
}
