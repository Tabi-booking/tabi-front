import * as React from "react";
import { selectClass } from "@/shared/lib/ui-classes";
import { cn } from "@/shared/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
}

export function SelectField({
  value,
  onValueChange,
  options,
  placeholder,
  className,
  disabled,
  ...props
}: SelectFieldProps) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onValueChange(e.target.value)}
      className={cn(selectClass, className)}
      {...props}
    >
      {placeholder && (
        <option value="" disabled hidden>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
