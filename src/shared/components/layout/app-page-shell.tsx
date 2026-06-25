"use client";

import { ReactNode } from "react";
import { PageHeader } from "@/shared/components/layout/page-header";
import { cn } from "@/shared/lib/utils";

interface AppPageShellProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AppPageShell({
  title,
  description,
  actions,
  children,
  className,
}: AppPageShellProps) {
  return (
    <div className={cn("flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8", className)}>
      <PageHeader title={title} description={description} actions={actions} />
      {children}
    </div>
  );
}
