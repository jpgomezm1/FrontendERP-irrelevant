
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { convertCurrency, Currency, formatCurrency } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
  currencySymbol?: string;
  originalCurrency?: Currency;
  displayCurrency?: Currency;
  originalValue?: number;
  showConversionInfo?: boolean;
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  className,
  currencySymbol,
  originalCurrency,
  displayCurrency,
  originalValue,
  showConversionInfo = true,
}: StatsCardProps) {
  // If currency conversion info should be shown
  const showConversion = showConversionInfo && 
                         originalCurrency && 
                         displayCurrency && 
                         originalCurrency !== displayCurrency && 
                         typeof originalValue === "number";

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/20">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent className="pt-6">
        <div className="text-2xl font-bold flex items-center">
          {currencySymbol && <span className="mr-1">{currencySymbol}</span>}
          <span>{value}</span>
          
          {showConversion && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="ml-2 cursor-help">
                    <InfoIcon className="h-4 w-4 text-muted-foreground" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Original: {formatCurrency(originalValue, originalCurrency)}</p>
                  <p>Valor convertido usando tasa aproximada</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        
        {trend && (
          <div
            className={`flex items-center text-xs ${
              trend === "up" 
                ? "text-green-500" 
                : trend === "down" 
                  ? "text-red-500" 
                  : "text-gray-500"
            }`}
          >
            {trend === "up" 
              ? "↑" 
              : trend === "down" 
                ? "↓" 
                : "→"} {trendValue}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default StatsCard;
