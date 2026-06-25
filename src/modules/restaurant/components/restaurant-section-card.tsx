"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface RestaurantSectionCardProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
  accent?: "coral" | "navy";
}

export function RestaurantSectionCard({
  title,
  icon: Icon,
  children,
  className,
  accent = "coral",
}: RestaurantSectionCardProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 border-b border-border px-5 py-4",
          accent === "coral"
            ? "bg-gradient-to-r from-primary/8 via-primary/4 to-transparent"
            : "bg-gradient-to-r from-tabi-navy/6 via-tabi-navy/3 to-transparent",
        )}
      >
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm",
            accent === "coral"
              ? "bg-primary text-primary-foreground"
              : "bg-tabi-navy text-white",
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
