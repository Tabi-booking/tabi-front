"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/shared/components/native/button";
import { Label } from "@/shared/components/native/label";
import { cn } from "@/shared/lib/utils";

interface PersonasStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function PersonasStepper({
  value,
  onChange,
  min = 1,
  max = 50,
  className,
}: PersonasStepperProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label>Número de personas</Label>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          aria-label="Menos personas"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <div className="flex min-w-[4.5rem] flex-col items-center">
          <span className="text-2xl font-bold tabular-nums text-foreground">{value}</span>
          <span className="text-xs text-muted-foreground">personas</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          aria-label="Más personas"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <div className="ml-1 flex flex-wrap gap-1.5">
          {[2, 4, 6, 8].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={cn(
                "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                value === n
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
