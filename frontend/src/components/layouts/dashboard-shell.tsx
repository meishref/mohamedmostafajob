import type { ReactNode } from "react";

interface DashboardShellProps {
  children: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
}

export function DashboardShell({ children, sidebar, header }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {sidebar && (
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-y-auto border-r bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/70 lg:block">
          {sidebar}
        </aside>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        {header && (
          <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
            {header}
          </header>
        )}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl animate-in fade-in-0 duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
