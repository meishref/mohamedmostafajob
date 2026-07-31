import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface DashboardChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  isEmpty?: boolean;
  emptyMessage?: string;
}

export function DashboardChartCard({
  title,
  description,
  children,
  className,
  isEmpty,
  emptyMessage = "No data available",
}: DashboardChartCardProps) {
  return (
    <Card className={cn("overflow-hidden transition-shadow duration-200 hover:shadow-md", className)}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

export function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-56 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-[280px] animate-pulse rounded-lg bg-muted" />
      </CardContent>
    </Card>
  );
}
