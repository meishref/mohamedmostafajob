"use client";

import type { PaginatedMeta } from "@/types/api";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface TablePaginationProps {
  meta?: PaginatedMeta;
  onPageChange: (page: number) => void;
  isFetching?: boolean;
}

export function TablePagination({ meta, onPageChange, isFetching }: TablePaginationProps) {
  const t = useTranslations("common");

  if (!meta || meta.last_page <= 1) return null;

  return (
    <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {t("pageOf", {
          current: meta.current_page,
          total: meta.last_page,
          count: meta.total,
        })}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={meta.current_page <= 1 || isFetching}
          onClick={() => onPageChange(meta.current_page - 1)}
        >
          {t("previous")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={meta.current_page >= meta.last_page || isFetching}
          onClick={() => onPageChange(meta.current_page + 1)}
        >
          {t("next")}
        </Button>
      </div>
    </div>
  );
}
