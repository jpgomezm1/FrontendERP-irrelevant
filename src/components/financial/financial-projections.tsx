
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { AlertCircle } from "lucide-react";

interface ProjectionData {
  month: string;
  year: number;
  projectedIncome: number;
  projectedExpense: number;
  projectedBalance: number;
}

interface FinancialProjectionsProps {
  currentData: {
    name: string;
    ingresos: number;
    gastos: number;
    balance: number;
  };
  projectionData: ProjectionData[];
  metrics: {
    burnRate: number;
    mrr: number;
    mrrProjected: number;
    topClientPercentage: number;
    monthlyVariation: {
      income: { value: number; percentage: number };
      expense: { value: number; percentage: number };
    };
    structuralExpenses: number;
    avoidableExpenses: number;
    ytdProfit: number;
  };
}

export function FinancialProjections({ currentData, projectionData, metrics }: FinancialProjectionsProps) {
  const [projectionScenario, setProjectionScenario] = React.useState("base");
  const [projectionPeriod, setProjectionPeriod] = React.useState("6");
  
  // Calculamos diferentes escenarios de proyección
  const scenarios = {
    base: projectionData,
    optimistic: projectionData.map(item => ({
      ...item,
      projectedIncome: Math.round(item.projectedIncome * 1.15),
      projectedExpense: item.projectedExpense,
      projectedBalance: Math.round(item.projectedIncome * 1.15) - item.projectedExpense
    })),
    pessimistic: projectionData.map(item => ({
      ...item,
      projectedIncome: Math.round(item.projectedIncome * 0.85),
      projectedExpense: Math.round(item.projectedExpense * 1.1),
      projectedBalance: Math.round(item.projectedIncome * 0.85) - Math.round(item.projectedExpense * 1.1)
    })),
    costCutting: projectionData.map(item => ({
      ...item,
      projectedIncome: item.projectedIncome,
      projectedExpense: Math.round(item.projectedExpense * 0.9),
      projectedBalance: item.projectedIncome - Math.round(item.projectedExpense * 0.9)
    }))
  };
  
  const selectedScenario = scenarios[projectionScenario as keyof typeof scenarios];
  const visibleData = selectedScenario.slice(0, parseInt(projectionPeriod));
  
  // Calculamos el runway proyectado
  const averageExpense = visibleData.reduce((sum, item) => sum + item.projectedExpense, 0) / visibleData.length;
  const finalBalance = visibleData[visibleData.length - 1].projectedBalance;
  const projectedRunway = finalBalance / averageExpense;
  
  // Determinamos si hay riesgos financieros
  const hasNegativeBalance = visibleData.some(item => item.projectedBalance < 0);
  const hasCashflowRisk = projectedRunway < 3;
  const hasDecreasingTrend = visibleData[visibleData.length - 1].projectedBalance < visibleData[0].projectedBalance;
  
  // Lista concatenada para mostrar datos reales + proyecciones
  const combinedData = [
    {
      month: currentData.name,
      year: new Date().getFullYear(),
      projectedIncome: currentData.ingresos,
      projectedExpense: currentData.gastos,
      projectedBalance: currentData.balance,
      isHistorical: true
    },
    ...visibleData.map(item => ({...item, isHistorical: false}))
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Proyección Financiera</CardTitle>
            <CardDescription>
              Análisis predictivo del flujo de caja
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Escenario</label>
                <Select value={projectionScenario} onValueChange={setProjectionScenario}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escenario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="base">Base (Tendencia actual)</SelectItem>
                    <SelectItem value="optimistic">Optimista (+15% ingresos)</SelectItem>
                    <SelectItem value="pessimistic">Pesimista (-15% ingresos, +10% gastos)</SelectItem>
                    <SelectItem value="costCutting">Reducción de costos (-10% gastos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Período</label>
                <Select value={projectionPeriod} onValueChange={setProjectionPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Meses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 meses</SelectItem>
                    <SelectItem value="6">6 meses</SelectItem>
                    <SelectItem value="12">12 meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {(hasNegativeBalance || hasCashflowRisk || hasDecreasingTrend) && (
              <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="text-amber-500 h-5 w-5" />
                <div className="text-sm">
                  <p className="font-medium">Alerta financiera</p>
                  <p className="text-muted-foreground">
                    {hasNegativeBalance && "Se proyecta un saldo negativo en el período analizado. "}
                    {hasCashflowRisk && "El runway proyectado es menor a 3 meses. "}
                    {hasDecreasingTrend && "La tendencia del saldo es decreciente. "}
                    Considera ajustar tu estrategia financiera.
                  </p>
                </div>
              </div>
            )}
            
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={combinedData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4ade80" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={(value, index) => {
                      const item = combinedData[index];
                      return `${value}${item?.isHistorical ? ' (actual)' : ''}`;
                    }}
                  />
                  <YAxis tickFormatter={(value) => `$${value / 1000000}M`} />
                  <Tooltip 
                    formatter={(value, name) => {
                      const formattedValue = formatCurrency(Number(value));
                      if (name === "projectedIncome") return ["Ingresos", formattedValue];
                      if (name === "projectedExpense") return ["Gastos", formattedValue];
                      return ["Balance", formattedValue];
                    }}
                    labelFormatter={(label, items) => {
                      const index = items[0]?.payload?.isHistorical ? " (actual)" : " (proyectado)";
                      return `${label}${index}`;
                    }}
                  />
                  <Legend 
                    payload={[
                      { value: 'Ingresos', type: 'line', color: '#4ade80' },
                      { value: 'Gastos', type: 'line', color: '#f87171' },
                      { value: 'Balance', type: 'line', color: '#60a5fa' }
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="projectedIncome"
                    stroke="#4ade80"
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="projectedExpense"
                    stroke="#f87171"
                    fillOpacity={1}
                    fill="url(#colorExpense)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="projectedBalance"
                    stroke="#60a5fa"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    activeDot={{ r: 8 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ProjectionMetricCard 
          title="Balance Final Proyectado" 
          value={formatCurrency(finalBalance)} 
          change={finalBalance - currentData.balance} 
          status={finalBalance > currentData.balance ? "positive" : "negative"} 
        />
        
        <ProjectionMetricCard 
          title="Runway Proyectado" 
          value={`${projectedRunway.toFixed(1)} meses`} 
          change={projectedRunway - (currentData.balance / metrics.burnRate)}
          status={projectedRunway > (currentData.balance / metrics.burnRate) ? "positive" : "negative"} 
          isMonths
        />
        
        <ProjectionMetricCard 
          title="Variación Ingresos" 
          value={`${((visibleData[visibleData.length - 1].projectedIncome / currentData.ingresos - 1) * 100).toFixed(1)}%`} 
          change={visibleData[visibleData.length - 1].projectedIncome - currentData.ingresos} 
          status={visibleData[visibleData.length - 1].projectedIncome > currentData.ingresos ? "positive" : "negative"} 
        />
        
        <ProjectionMetricCard 
          title="Variación Gastos" 
          value={`${((visibleData[visibleData.length - 1].projectedExpense / currentData.gastos - 1) * 100).toFixed(1)}%`} 
          change={currentData.gastos - visibleData[visibleData.length - 1].projectedExpense} 
          status={visibleData[visibleData.length - 1].projectedExpense < currentData.gastos ? "positive" : "negative"} 
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tabla de Proyección Mensual</CardTitle>
          <CardDescription>Detalle de los valores proyectados por mes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left font-medium p-2">Mes</th>
                  <th className="text-right font-medium p-2">Ingresos</th>
                  <th className="text-right font-medium p-2">Gastos</th>
                  <th className="text-right font-medium p-2">Balance</th>
                  <th className="text-right font-medium p-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {combinedData.map((item, index) => (
                  <tr key={index} className={`border-b ${item.isHistorical ? 'bg-muted/50' : ''}`}>
                    <td className="p-2">
                      {item.month} {item.isHistorical && <Badge variant="outline">actual</Badge>}
                    </td>
                    <td className="text-right p-2 text-green-600">
                      {formatCurrency(item.projectedIncome)}
                    </td>
                    <td className="text-right p-2 text-red-600">
                      {formatCurrency(item.projectedExpense)}
                    </td>
                    <td className="text-right p-2 font-medium">
                      {formatCurrency(item.projectedBalance)}
                    </td>
                    <td className="text-right p-2">
                      <Badge variant={item.projectedBalance > 0 ? "success" : "destructive"}>
                        {item.projectedBalance > 0 ? "Positivo" : "Negativo"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para tarjeta de métrica de proyección
interface ProjectionMetricCardProps {
  title: string;
  value: string;
  change: number;
  status: "positive" | "negative" | "neutral";
  isMonths?: boolean;
}

function ProjectionMetricCard({ title, value, change, status, isMonths = false }: ProjectionMetricCardProps) {
  const statusColors = {
    positive: "bg-green-50 border-green-200",
    negative: "bg-red-50 border-red-200",
    neutral: "bg-blue-50 border-blue-200",
  };

  return (
    <Card className={`border ${statusColors[status]}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold">{value}</div>
        <p className="text-xs flex items-center mt-1">
          {status === "positive" ? (
            <span className="text-green-600 flex items-center">
              ▲ {isMonths ? `+${change.toFixed(1)} meses` : formatCurrency(change)}
            </span>
          ) : (
            <span className="text-red-600 flex items-center">
              ▼ {isMonths ? `${change.toFixed(1)} meses` : formatCurrency(Math.abs(change))}
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
