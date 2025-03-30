
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
  currencySymbol?: string;
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
}: StatsCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {currencySymbol && <span className="mr-1">{currencySymbol}</span>}
          {value}
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
