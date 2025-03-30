
import React from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (value: number) => void;
}

export const CurrencyInput = React.forwardRef<
  HTMLInputElement,
  CurrencyInputProps
>(({ className, onValueChange, value, ...props }, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^\d]/g, "");
    const numericValue = rawValue ? parseInt(rawValue, 10) : 0;
    
    if (onValueChange) {
      onValueChange(numericValue);
    }
    
    if (props.onChange) {
      props.onChange(e);
    }
  };

  // Format for display
  const displayValue = value 
    ? new Intl.NumberFormat('es-CO').format(Number(value))
    : '';

  return (
    <div className="relative flex items-center">
      <span className="absolute left-3 text-gray-500">$</span>
      <Input
        {...props}
        className={cn("pl-8", className)}
        value={displayValue}
        onChange={handleChange}
        type="text"
        inputMode="numeric"
        ref={ref}
      />
    </div>
  );
});

CurrencyInput.displayName = "CurrencyInput";
