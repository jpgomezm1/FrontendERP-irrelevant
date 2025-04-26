
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIncomeAnalytics } from "@/hooks/use-income-analytics";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

export function IncomeAnalysis() {
  const [timeFrame, setTimeFrame] = useState<"month" | "quarter" | "year">("month");
  const { data: analytics, isLoading, isError, error } = useIncomeAnalytics(timeFrame);
  const queryClient = useQueryClient();
  
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['income-analytics'] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <p className="text-destructive">Error al cargar los datos de análisis</p>
        <p className="text-sm text-muted-foreground mb-2">{(error as Error)?.message || 'Hubo un problema al obtener los datos'}</p>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  if (!analytics || (analytics.monthly_data.length === 0 && analytics.total_month === 0)) {
    return (
      <div className="text-center py-8 space-y-4">
        <p className="text-gray-500">No hay datos de ingresos disponibles para analizar</p>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex justify-between items-center">
        <Select value={timeFrame} onValueChange={(value: "month" | "quarter" | "year") => setTimeFrame(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Periodo de análisis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Último Mes</SelectItem>
            <SelectItem value="quarter">Último Trimestre</SelectItem>
            <SelectItem value="year">Último Año</SelectItem>
          </SelectContent>
        </Select>
        
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total del Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {formatCurrency(analytics.total_month)}
            </div>
            <p className="text-xs text-blue-600/80">Este mes</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Promedio Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(analytics.avg_month)}
            </div>
            <p className="text-xs text-green-600/80">
              {timeFrame === "month" ? "Último mes" : 
               timeFrame === "quarter" ? "Último trimestre" : 
               "Último año"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Por Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {formatCurrency(analytics.client_income)}
            </div>
            <p className="text-xs text-purple-600/80">
              {analytics.client_percentage.toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Análisis de Ingresos Mensuales</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.monthly_data.length > 0 ? (
            <div className="h-[400px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.monthly_data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), "Ingresos"]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="ingresos"
                    fill="url(#colorGradient)"
                    radius={[4, 4, 0, 0]}
                    name="Ingresos"
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#818CF8" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex justify-center items-center h-[300px] text-gray-400">
              No hay suficientes datos para mostrar el gráfico
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
