"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@tanisya/ui/components/button";

interface PaginationControlsProps {
  page:         number;
  totalPages:   number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  page, totalPages, onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>Halaman {page} dari {totalPages}</span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}