"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function LoadingSpinner({
  className,
  size = "md",
  label = "Loading",
}: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)} role="status">
      <Loader2 className={cn("animate-spin text-muted-foreground", sizeClasses[size])} />
      <span className="sr-only">{label}</span>
    </div>
  );
}
