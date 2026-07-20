"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const fieldInput =
  "h-11 rounded-md border border-zinc-200 bg-white px-2.5 text-base sm:text-sm";

export const selectInput =
  "h-11 w-full cursor-pointer rounded-md border border-zinc-200 bg-white px-2.5 text-base sm:text-sm appearance-auto touch-manipulation";

const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
] as const;

export function GenderSelect({
  id = "gender",
  value,
  onChange,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative z-10 space-y-1.5">
      <Label htmlFor={id} className="text-[13px] text-zinc-600">
        Gender
      </Label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={selectInput}
      >
        {GENDER_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function PasswordMatchHint({
  password,
  confirmPassword,
}: {
  password: string;
  confirmPassword: string;
}) {
  if (!confirmPassword) return null;

  const matches = password === confirmPassword;
  return (
    <p
      className={`text-[12px] ${matches ? "text-emerald-600" : "text-red-600"}`}
      role="status"
    >
      {matches ? "Passwords match." : "Passwords do not match."}
    </p>
  );
}

export function Field({
  label,
  id,
  value,
  onChange,
  type = "text",
  required,
  className,
  placeholder,
  hint,
  autoComplete,
  minLength,
  preventEnterSubmit,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (key: string, value: string) => void;
  type?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
  hint?: string;
  autoComplete?: string;
  minLength?: number;
  preventEnterSubmit?: boolean;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label htmlFor={id} className="text-[13px] text-zinc-600">
        {label}
        {!required && (
          <span className="ml-1 font-normal text-zinc-400">(optional)</span>
        )}
      </Label>
      <Input
        id={id}
        name={id}
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={minLength}
        onKeyDown={
          preventEnterSubmit
            ? (e) => {
                if (e.key === "Enter") e.preventDefault();
              }
            : undefined
        }
        onChange={(e) => onChange(id, e.target.value)}
        className={fieldInput}
      />
      {hint && <p className="text-[11px] text-zinc-400">{hint}</p>}
    </div>
  );
}
