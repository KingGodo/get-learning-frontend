"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OneOffPasswordField({
  id = "oneOffPassword",
  value,
  onChange,
  disabled,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[13px] text-zinc-600">
        One-time password
        <span className="ml-1 font-normal text-zinc-400">(optional)</span>
      </Label>
      <Input
        id={id}
        type="text"
        autoComplete="new-password"
        minLength={8}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-md bg-transparent font-mono"
        placeholder="Leave blank to generate one"
      />
      <p className="text-[12px] text-zinc-500">
        Set a password to copy with the login email, or leave blank and we will
        generate one. Minimum 8 characters if you set it.
      </p>
    </div>
  );
}
