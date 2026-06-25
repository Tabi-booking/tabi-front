"use client";

import { Label } from "@/shared/components/native/label";
import { cn } from "@/shared/lib/utils";

const HORARIOS_SUGERIDOS = ["12:00", "13:00", "14:00", "19:00", "20:00", "21:00", "22:00"];

interface HoraQuickPicksProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function HoraQuickPicks({ value, onChange, className }: HoraQuickPicksProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label>Horarios frecuentes</Label>
      <div className="flex flex-wrap gap-2">
        {HORARIOS_SUGERIDOS.map((hora) => (
          <button
            key={hora}
            type="button"
            onClick={() => onChange(hora)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
              value === hora
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:border-primary/40",
            )}
          >
            {hora}
          </button>
        ))}
      </div>
    </div>
  );
}
