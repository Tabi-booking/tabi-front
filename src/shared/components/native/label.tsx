import * as React from "react";
import { labelClass } from "@/shared/lib/ui-classes";
import { cn } from "@/shared/lib/utils";

export const Label = React.forwardRef<HTMLLabelElement, React.ComponentProps<"label">>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn(labelClass, className)} {...props} />
  ),
);
Label.displayName = "Label";
