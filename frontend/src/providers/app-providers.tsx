import { ConfirmDialogProvider } from "@/components/common/confirm-dialog-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/providers/toast-provider";
import type { ReactNode } from "react";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <ConfirmDialogProvider>
          {children}
          <ToastProvider />
        </ConfirmDialogProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
