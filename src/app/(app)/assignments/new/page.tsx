"use client";

import { Suspense } from "react";
import NewAssignmentForm from "./new-assignment-form";
import { PageLoading } from "@/components/ui/page-loading";

export default function NewAssignmentPage() {
  return (
    <Suspense fallback={<PageLoading label="Loading…" />}>
      <NewAssignmentForm />
    </Suspense>
  );
}
