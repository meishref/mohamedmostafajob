"use client";

import type { ReactNode } from "react";
import { ErrorState } from "@/components/common/error-state";
import { TableSkeleton } from "@/components/common/table-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import type { PaginatedMeta } from "@/types/api";
import { TablePagination } from "@/components/common/table-pagination";

interface DataTableCardProps {
  children: ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyState?: ReactNode;
  meta?: PaginatedMeta;
  onPageChange?: (page: number) => void;
  isFetching?: boolean;
  skeletonColumns?: number;
  skeletonRows?: number;
}

export function DataTableCard({
  children,
  isLoading = false,
  isError = false,
  onRetry,
  isEmpty = false,
  emptyState,
  meta,
  onPageChange,
  isFetching,
  skeletonColumns = 6,
  skeletonRows = 8,
}: DataTableCardProps) {
  return (
    <Card>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4">
            <TableSkeleton columns={skeletonColumns} rows={skeletonRows} />
          </div>
        ) : isError ? (
          <div className="p-6">
            <ErrorState onRetry={onRetry} />
          </div>
        ) : isEmpty ? (
          emptyState
        ) : (
          <>
            {children}
            {onPageChange && (
              <TablePagination
                meta={meta}
                onPageChange={onPageChange}
                isFetching={isFetching}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
