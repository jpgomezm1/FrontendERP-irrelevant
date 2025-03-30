
import React from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { Currency, CURRENCIES } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

interface CurrencyInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (value: number) => void;
  currency?: Currency;
  onCurrencyChange?: (currency: Currency) => void;
  showCurrencySelector?: boolean;
  label?: string;
}

export const CurrencyInput = React.forwardRef<
  HTMLInputElement,
  CurrencyInputProps
>(({ 
  className, 
  onValueChange, 
  value, 
  currency = "COP",
  onCurrencyChange,
  showCurrencySelector = false,
  label,
  ...props 
}, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle either currency format - remove all non-digit characters except decimal point
    const rawValue = e.target.value.replace(/[^\d.]/g, "");
    
    // Handle decimal precision based on currency
    const decimalPlaces = CURRENCIES[currency].decimalPlaces;
    let numericValue: number;
    
    if (rawValue.includes('.')) {
      const parts = rawValue.split('.');
      const integerPart = parts[0] || '0';
      const decimalPart = parts[1]?.substring(0, decimalPlaces) || '';
      numericValue = parseFloat(`${integerPart}.${decimalPart}`);
    } else {
      numericValue = parseFloat(rawValue) || 0;
    }
    
    if (onValueChange) {
      onValueChange(numericValue);
    }
    
    if (props.onChange) {
      props.onChange(e);
    }
  };

  // Format for display based on selected currency
  const displayValue = value 
    ? new Intl.NumberFormat(CURRENCIES[currency].locale, {
        minimumFractionDigits: CURRENCIES[currency].decimalPlaces,
        maximumFractionDigits: CURRENCIES[currency].decimalPlaces
      }).format(Number(value))
    : '';

  const currencySymbol = CURRENCIES[currency].symbol;

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium block">{label}</label>
      )}
      <div className="flex gap-2">
        {showCurrencySelector && onCurrencyChange && (
          <Select 
            value={currency} 
            onValueChange={(val) => onCurrencyChange(val as Currency)}
          >
            <SelectTrigger className="w-[90px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="COP">COP</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
        )}
        <div className="relative flex items-center flex-1">
          <span className="absolute left-3 text-gray-500">{currencySymbol}</span>
          <Input
            {...props}
            className={cn("pl-8", className)}
            value={displayValue}
            onChange={handleChange}
            type="text"
            inputMode="decimal"
            ref={ref}
          />
        </div>
      </div>
    </div>
  );
});

CurrencyInput.displayName = "CurrencyInput";
