"use client";

import { Button } from "@/components/ui/button";

/** List footer pinned to the bottom of the page content / viewport. */
export function ListPagination({
  rangeStart,
  rangeEnd,
  total,
  page,
  totalPages,
  onPrevious,
  onNext,
}: {
  rangeStart: number;
  rangeEnd: number;
  total: number;
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="sticky bottom-0 z-10 mt-auto -mx-4 border-t border-border bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/90 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] text-zinc-400">
          Showing {rangeStart}–{rangeEnd} of {total}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={onPrevious}
          >
            Previous
          </Button>
          <span className="min-w-[4.5rem] text-center text-[12px] tabular-nums text-zinc-500">
            {page} / {totalPages}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={onNext}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
