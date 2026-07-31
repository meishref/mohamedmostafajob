import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: "card" | "inline";
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "card",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-6 py-16 text-center animate-in fade-in-0 duration-300",
        variant === "card" && "rounded-xl border border-dashed bg-muted/20",
        className,
      )}
    >
      {Icon && (
        <div className="rounded-2xl bg-primary/10 p-4 text-primary shadow-sm">
          <Icon className="h-8 w-8" aria-hidden="true" />
        </div>
      )}
      <div className="max-w-sm space-y-1">
        <p className="text-base font-semibold tracking-tight">{title}</p>
        {description && (
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
