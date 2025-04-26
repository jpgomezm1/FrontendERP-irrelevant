
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, TrendingUp, TrendingDown, Wallet, Clock, DollarSign } from "lucide-react";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  Area, AreaChart
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { TimePeriod } from "@/hooks/use-dashboard-data";

type MetricsData = {
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

interface FinancialDashboardProps {
  metrics: MetricsData;
  monthlyData: any[];
  clientData: any[];
  expenseData: any[];
  expenseHeatMap: any[];
  onTimeFrameChange: (value: TimePeriod) => void;
  timeFrame: TimePeriod;
}

const COLORS = ['#4ade80', '#f87171', '#60a5fa', '#fbbf24', '#a78bfa', '#fb923c'];

export function FinancialDashboard({ 
  metrics, 
  monthlyData, 
  clientData, 
  expenseData,
  expenseHeatMap,
  onTimeFrameChange,
  timeFrame 
}: FinancialDashboardProps) {
  const [kpiView, setKpiView] = useState<"basic" | "advanced">("basic");
  
  // Calcular runway basado en burn rate
  const runway = metrics.burnRate > 0 
    ? metrics.mrr >= metrics.burnRate 
      ? "∞" // Runway infinito si MRR > burn rate
      : Number((metrics.mrr / metrics.burnRate).toFixed(1))
    : "∞";
        
  // Calcular el estado de los KPIs
  const mrrPerformance = metrics.mrr >= metrics.mrrProjected ? "positive" : "negative";
  const variationStatus = metrics.monthlyVariation.income.percentage > 0 ? "positive" : "negative";
  const runwayStatus = typeof runway === 'string' || runway > 6 ? "positive" : runway > 3 ? "warning" : "negative";

  // Translated time frame labels
  const timeFrameLabels = {
    'month': 'Este Mes',
    'prev-month': 'Mes Anterior',
    'quarter': 'Este Trimestre',
    'prev-quarter': 'Trimestre Anterior',
    'ytd': 'Año a la Fecha (YTD)',
    'year': 'Este Año'
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Tabs value={kpiView} onValueChange={(v) => setKpiView(v as "basic" | "advanced")}>
          <TabsList>
            <TabsTrigger value="basic">Métricas Básicas</TabsTrigger>
            <TabsTrigger value="advanced">Métricas Avanzadas</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Select value={timeFrame} onValueChange={(value) => onTimeFrameChange(value as TimePeriod)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">{timeFrameLabels.month}</SelectItem>
            <SelectItem value="prev-month">{timeFrameLabels['prev-month']}</SelectItem>
            <SelectItem value="quarter">{timeFrameLabels.quarter}</SelectItem>
            <SelectItem value="prev-quarter">{timeFrameLabels['prev-quarter']}</SelectItem>
            <SelectItem value="ytd">{timeFrameLabels.ytd}</SelectItem>
            <SelectItem value="year">{timeFrameLabels.year}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tabs value={kpiView} onValueChange={(v) => setKpiView(v as "basic" | "advanced")}>
        <TabsContent value="basic">
          <div className="grid gap-4 md:grid-cols-4">
            <KpiCard 
              title="Burn Rate Mensual" 
              value={formatCurrency(metrics.burnRate)} 
              icon={<TrendingDown />}
              description="Gasto promedio mensual"
              status="neutral"
            />
            
            <KpiCard 
              title="MRR Actual" 
              value={formatCurrency(metrics.mrr)} 
              icon={<TrendingUp />}
              description={`${mrrPerformance === "positive" ? "+" : ""}${((metrics.mrr / metrics.mrrProjected - 1) * 100).toFixed(1)}% vs proyectado`}
              status={mrrPerformance}
            />
            
            <KpiCard 
              title="Runway" 
              value={typeof runway === "string" ? runway : `${runway.toFixed(1)} meses`}
              icon={<Clock />}
              description={typeof runway === "string" ? "MRR cubre gastos" : "Basado en burn rate actual"}
              status={runwayStatus}
            />
            
            <KpiCard 
              title="Variación Mensual" 
              value={formatCurrency(metrics.monthlyVariation.income.value)} 
              icon={metrics.monthlyVariation.income.percentage > 0 ? <TrendingUp /> : <TrendingDown />}
              description={`${metrics.monthlyVariation.income.percentage > 0 ? "+" : ""}${metrics.monthlyVariation.income.percentage.toFixed(1)}% vs período anterior`}
              status={variationStatus}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="advanced">
          <div className="grid gap-4 md:grid-cols-4">
            <KpiCard 
              title="Utilidad YTD" 
              value={formatCurrency(metrics.ytdProfit)} 
              icon={<Wallet />}
              description="Acumulado año a la fecha"
              status="neutral"
            />
            
            <KpiCard 
              title="Concentración de Clientes" 
              value={`${metrics.topClientPercentage.toFixed(1)}%`} 
              icon={<AlertCircle />}
              description="Del ingreso en cliente principal"
              status={metrics.topClientPercentage > 40 ? "negative" : "neutral"}
            />
            
            <KpiCard 
              title="Gastos Estructurales" 
              value={formatCurrency(metrics.structuralExpenses)} 
              icon={<DollarSign />}
              description={`${metrics.burnRate > 0 ? ((metrics.structuralExpenses / metrics.burnRate) * 100).toFixed(0) : 0}% del gasto total`}
              status="neutral"
            />
            
            <KpiCard 
              title="Gastos Evitables" 
              value={formatCurrency(metrics.avoidableExpenses)} 
              icon={<DollarSign />}
              description={`${metrics.burnRate > 0 ? ((metrics.avoidableExpenses / metrics.burnRate) * 100).toFixed(0) : 0}% del gasto total`}
              status="neutral"
            />
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos vs Gastos (6 meses)</CardTitle>
            <CardDescription>Comparativa mensual y tendencia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData.slice(0, 6)} // Limit to 6 months for better visualization
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-md p-2 shadow-md">
                            <p className="font-medium">{payload[0]?.payload.name}</p>
                            <p className="text-sm text-green-600">
                              Ingresos: {formatCurrency(payload[0]?.value as number)}
                            </p>
                            <p className="text-sm text-red-600">
                              Gastos: {formatCurrency(payload[1]?.value as number)}
                            </p>
                            <p className="text-sm text-blue-600">
                              Balance: {formatCurrency(payload[2]?.value as number)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="ingresos" name="Ingresos" fill="#4ade80" />
                  <Bar dataKey="gastos" name="Gastos" fill="#f87171" />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    name="Balance"
                    stroke="#60a5fa"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Gastos e Ingresos</CardTitle>
            <CardDescription>Desglose por categoría y por cliente</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="expenses">
              <TabsList className="mb-4">
                <TabsTrigger value="expenses">Gastos</TabsTrigger>
                <TabsTrigger value="income">Ingresos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="expenses" className="h-[300px]">
                {expenseData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No hay datos de gastos para mostrar
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="income" className="h-[300px]">
                {clientData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={clientData.sort((a, b) => b.value - a.value)}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="name" width={80} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="value" name="Ingresos" fill="#4ade80" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No hay datos de ingresos para mostrar
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Evolución mensual de Ingresos y Gastos</CardTitle>
          <CardDescription>
            Tendencia mensual y calculo de variación porcentual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4ade80" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value, name) => [
                      formatCurrency(Number(value)), 
                      name === "ingresos" ? "Ingresos" : "Gastos"
                    ]}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="ingresos"
                    name="Ingresos"
                    stroke="#4ade80"
                    fillOpacity={1}
                    fill="url(#colorIngresos)"
                  />
                  <Area
                    type="monotone"
                    dataKey="gastos"
                    name="Gastos"
                    stroke="#f87171"
                    fillOpacity={1}
                    fill="url(#colorGastos)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No hay datos suficientes para mostrar la evolución
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para tarjetas KPI
interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  status: "positive" | "negative" | "warning" | "neutral";
}

function KpiCard({ title, value, icon, description, status }: KpiCardProps) {
  const statusColors = {
    positive: "bg-green-50 border-green-200",
    negative: "bg-red-50 border-red-200",
    warning: "bg-amber-50 border-amber-200",
    neutral: "bg-blue-50 border-blue-200",
  };

  const iconColors = {
    positive: "text-green-500",
    negative: "text-red-500",
    warning: "text-amber-500",
    neutral: "text-blue-500",
  };

  return (
    <Card className={`border ${statusColors[status]}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm">{title}</CardTitle>
          <div className={iconColors[status]}>
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
