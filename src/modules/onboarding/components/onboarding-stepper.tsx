"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";

const STEPS = [
  { href: "/onboarding/ubicacion", label: "Ubicación", step: 1 },
  { href: "/onboarding/horarios", label: "Horarios", step: 2 },
  { href: "/onboarding/branding", label: "Branding", step: 3 },
  { href: "/onboarding/exito", label: "Listo", step: 4 },
];

export function OnboardingStepper() {
  const pathname = usePathname();
  const currentIndex = STEPS.findIndex((s) => pathname.startsWith(s.href));

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2">
        {STEPS.map((step, index) => {
          const active = index === currentIndex;
          const done = index < currentIndex;
          return (
            <div key={step.href} className="flex flex-1 items-center gap-2">
              <Link
                href={step.href}
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  active && "bg-primary text-primary-foreground",
                  done && "bg-success/20 text-success",
                  !active && !done && "bg-secondary text-muted-foreground",
                )}
              >
                {step.step}
              </Link>
              <span className={cn("hidden text-sm sm:inline", active ? "font-medium" : "text-muted-foreground")}>
                {step.label}
              </span>
              {index < STEPS.length - 1 && <div className="hidden h-px flex-1 bg-border sm:block" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
