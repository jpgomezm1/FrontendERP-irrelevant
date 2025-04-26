import React, { useState } from "react";
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
  const [rawInputValue, setRawInputValue] = useState<string>(
    value !== undefined && value !== null ? value.toString() : ''
  );
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Get raw input as a string without formatting
    const inputValue = e.target.value;
    
    // Only allow digits and a single decimal point
    const sanitizedValue = inputValue.replace(/[^\d.]/g, "");
    
    // Handle decimal points properly
    let formattedValue = sanitizedValue;
    if (sanitizedValue.includes('.')) {
      const parts = sanitizedValue.split('.');
      // Keep only first decimal point and limit decimal places
      const decimalPlaces = CURRENCIES[currency].decimalPlaces;
      const integerPart = parts[0] || '0';
      const decimalPart = parts[1]?.substring(0, decimalPlaces) || '';
      formattedValue = `${integerPart}.${decimalPart}`;
    }
    
    // Update the raw input value for display
    setRawInputValue(formattedValue);
    
    // Convert to number for the callback
    const numericValue = formattedValue ? parseFloat(formattedValue) : 0;
    
    // Call the onChange handlers
    if (onValueChange) {
      onValueChange(numericValue);
    }
    
    if (props.onChange) {
      props.onChange(e);
    }
  };

  // Format for display when the input loses focus or when showing elsewhere
  const getFormattedValue = (val: number): string => {
    return new Intl.NumberFormat(CURRENCIES[currency].locale, {
      minimumFractionDigits: CURRENCIES[currency].decimalPlaces,
      maximumFractionDigits: CURRENCIES[currency].decimalPlaces
    }).format(val);
  };

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
            value={rawInputValue}
            onChange={handleChange}
            type="text"
            inputMode="decimal"
            ref={ref}
            maxLength={15} // Allow up to 15 digits for large amounts
            onBlur={() => {
              // Format the value when the input loses focus
              if (value !== undefined && value !== null) {
                setRawInputValue(value.toString());
              }
            }}
          />
        </div>
      </div>
    </div>
  );
});

CurrencyInput.displayName = "CurrencyInput";
