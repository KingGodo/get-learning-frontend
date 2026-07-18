import { Suspense } from "react";
import AssignmentsPageClient from "./assignments-client";
import { PageLoading } from "@/components/ui/page-loading";

export default function AssignmentsPage() {
  return (
    <Suspense
      fallback={<PageLoading label="Loading assignments…" />}
    >
      <AssignmentsPageClient />
    </Suspense>
  );
}
