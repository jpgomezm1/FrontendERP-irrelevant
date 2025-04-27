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
import { RefreshCcw, Calendar, PieChart, TrendingUp, CreditCard, Users, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

export function IncomeAnalysis() {
  const [timeFrame, setTimeFrame] = useState<"month" | "quarter" | "year">("month");
  const { data: analytics, isLoading, isError, error } = useIncomeAnalytics(timeFrame);
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    queryClient.invalidateQueries({ queryKey: ['income-analytics'] })
      .then(() => setTimeout(() => setIsRefreshing(false), 500));
  };

  if (isLoading || isRefreshing) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <AlertCircle className="h-10 w-10 text-red-400 mb-2" />
        <p className="text-red-300">Error al cargar los datos de análisis</p>
        <p className="text-sm text-slate-400 mb-2">{(error as Error)?.message || 'Hubo un problema al obtener los datos'}</p>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm"
          className="bg-[#1e1756]/20 border-purple-800/20 text-white hover:bg-[#1e1756]/40"
        >
          <RefreshCcw className="h-4 w-4 mr-2 text-purple-400" />
          Reintentar
        </Button>
      </div>
    );
  }

  if (!analytics || (analytics.monthly_data.length === 0 && analytics.total_month === 0)) {
    return (
      <div className="text-center py-8 space-y-4">
        <p className="text-slate-300">No hay datos de ingresos disponibles para analizar</p>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm"
          className="bg-[#1e1756]/20 border-purple-800/20 text-white hover:bg-[#1e1756]/40"
        >
          <RefreshCcw className="h-4 w-4 mr-2 text-purple-400" />
          Actualizar
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex justify-between items-center">
        <Select value={timeFrame} onValueChange={(value: "month" | "quarter" | "year") => setTimeFrame(value)}>
          <SelectTrigger className="w-[180px] bg-[#1e1756]/20 border-purple-800/20 text-white">
            <Calendar className="h-4 w-4 mr-2 text-purple-400" />
            <SelectValue placeholder="Periodo de análisis" />
          </SelectTrigger>
          <SelectContent className="bg-[#1e1756] border-purple-800/30 text-white">
            <SelectItem value="month">Último Mes</SelectItem>
            <SelectItem value="quarter">Último Trimestre</SelectItem>
            <SelectItem value="year">Último Año</SelectItem>
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          className="bg-[#1e1756]/20 border-purple-800/20 text-white hover:bg-[#1e1756]/40"
          disabled={isRefreshing}
        >
          <RefreshCcw className={`h-4 w-4 mr-2 text-purple-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1e1756]/10 border-purple-800/20 text-white shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-base">
              <CreditCard className="h-4 w-4 mr-2 text-blue-400" />
              Total del Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(analytics.total_month)}
            </div>
            <p className="text-xs text-slate-300">Este mes</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1e1756]/10 border-purple-800/20 text-white shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-base">
              <TrendingUp className="h-4 w-4 mr-2 text-green-400" />
              Promedio Mensual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(analytics.avg_month)}
            </div>
            <p className="text-xs text-slate-300">
              {timeFrame === "month" ? "Último mes" : 
               timeFrame === "quarter" ? "Último trimestre" : 
               "Último año"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1e1756]/10 border-purple-800/20 text-white shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-base">
              <Users className="h-4 w-4 mr-2 text-purple-400" />
              Por Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(analytics.client_income)}
            </div>
            <div className="flex items-center">
              <span className="text-xs text-slate-300 mr-2">
                {analytics.client_percentage.toFixed(1)}% del total
              </span>
              <div className="w-16 h-2 bg-[#0f0b2a] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-600" 
                  style={{ width: `${analytics.client_percentage}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1e1756]/10 border-purple-800/20 text-white shadow-md">
        <CardHeader className="bg-[#1e1756]/30 border-b border-purple-800/20">
          <CardTitle className="flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-purple-400" />
            Análisis de Ingresos Mensuales
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {analytics.monthly_data.length > 0 ? (
            <div className="h-[400px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.monthly_data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-700/30" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis 
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} 
                    stroke="#94a3b8" 
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), "Ingresos"]}
                    contentStyle={{
                      backgroundColor: "#1e1756",
                      border: "1px solid #4338ca",
                      borderRadius: "0.5rem",
                      color: "#ffffff"
                    }}
                    labelStyle={{ color: "#c4b5fd" }}
                    cursor={{ fill: 'rgba(79, 70, 229, 0.1)' }}
                  />
                  <Legend 
                    formatter={(value) => <span className="text-slate-300">{value}</span>} 
                  />
                  <Bar
                    dataKey="ingresos"
                    fill="url(#colorGradient)"
                    radius={[4, 4, 0, 0]}
                    name="Ingresos"
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4c1d95" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex justify-center items-center h-[300px] text-slate-400">
              No hay suficientes datos para mostrar el gráfico
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}