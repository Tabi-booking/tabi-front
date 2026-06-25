import * as React from "react";
import { buttonClass, type ButtonSize, type ButtonVariant } from "@/shared/lib/ui-classes";
import { cn } from "@/shared/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonClass(variant, size), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
