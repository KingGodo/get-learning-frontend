"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { IssuedCredentials } from "@/lib/types";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";

export function CredentialsPanel({
  title = "Account credentials",
  description = "Share these once with the account holder. The temporary password will not be shown again.",
  credentials,
  footer,
}: {
  title?: string;
  description?: string;
  credentials: IssuedCredentials;
  footer?: React.ReactNode;
}) {
  const [copied, setCopied] = useState<"email" | "password" | "both" | null>(
    null,
  );

  async function copy(text: string, key: "email" | "password" | "both") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }

  return (
    <section className="rounded-md bg-amber-50 px-4 py-4 sm:px-5">
      <h2 className="text-[13px] font-medium text-brand-dark">{title}</h2>
      <p className="mt-1 text-[12px] text-zinc-600">{description}</p>

      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-white px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400">
              Email
            </p>
            <p className="mt-0.5 truncate text-[13px] font-medium text-brand-dark">
              {credentials.email}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-[12px]"
            onClick={() => copy(credentials.email, "email")}
          >
            {copied === "email" ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
            Copy
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-white px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400">
              Temporary password
            </p>
            <p className="mt-0.5 break-all font-mono text-[13px] font-medium text-brand-dark">
              {credentials.temporaryPassword}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-[12px]"
            onClick={() => copy(credentials.temporaryPassword, "password")}
          >
            {copied === "password" ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
            Copy
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-2.5 text-[12px]"
          onClick={() =>
            copy(
              `Email: ${credentials.email}\nPassword: ${credentials.temporaryPassword}`,
              "both",
            )
          }
        >
          {copied === "both" ? (
            <Check className="size-3.5" />
          ) : (
            <Copy className="size-3.5" />
          )}
          Copy both
        </Button>
        {credentials.mustChangePassword && (
          <p className="text-[12px] text-amber-800">
            They should change this password after first sign-in.
          </p>
        )}
      </div>

      {footer ? <div className="mt-4">{footer}</div> : null}
    </section>
  );
}
