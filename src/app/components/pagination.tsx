"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const hasPrev = page > 0;
  const hasNext = page + 1 < totalPages;

  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={!hasPrev}
        onClick={() => onPageChange(page - 1)}
        className="gap-1"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </Button>
      <div className="text-sm text-slate-600">
        Page <span className="font-semibold">{page + 1}</span> of{" "}
        <span className="font-semibold">{totalPages}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        disabled={!hasNext}
        onClick={() => onPageChange(page + 1)}
        className="gap-1"
        aria-label="Next page"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
