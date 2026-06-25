import type { HTMLAttributes } from "react";
import { badgeClass, type BadgeVariant } from "@/shared/lib/ui-classes";
import { cn } from "@/shared/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return <span className={cn(badgeClass(variant), className)} {...props} />;
}
