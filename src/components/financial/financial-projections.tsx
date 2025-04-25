
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, TrendingUp, TrendingDown, Clock } from "lucide-react";

export interface ProjectionData {
  month: string;
  year: number;
  projectedIncome: number;
  projectedExpense: number;
  projectedBalance: number;
}

interface CurrentData {
  name: string;
  ingresos: number;
  gastos: number;
  balance: number;
}

interface FinancialProjectionsProps {
  currentData: CurrentData;
  projectionData: ProjectionData[];
  metrics: {
    burnRate: number;
    mrr: number;
    structuralExpenses: number;
    ytdProfit: number;
  };
}

export function FinancialProjections({
  currentData,
  projectionData,
  metrics
}: FinancialProjectionsProps) {
  // Ensure currentData is defined with default values if it's not provided
  const safeCurrentData = currentData || { name: '', ingresos: 0, gastos: 0, balance: 0 };
  
  const [projectionType, setProjectionType] = useState("conservative");
  const [projectionScope, setProjectionScope] = useState("6m");
  
  // Calculamos runway actual y breakeven point
  const runway = metrics.mrr > 0 
    ? metrics.burnRate > metrics.mrr 
      ? (safeCurrentData.balance / (metrics.burnRate - metrics.mrr)).toFixed(1)
      : "∞" // Si MRR >= burnRate, runway es infinito
    : (safeCurrentData.balance / metrics.burnRate).toFixed(1);
  
  const isRunwayInfinite = runway === "∞";
  const runwayMonths = isRunwayInfinite ? 999 : parseFloat(runway);
  const breakEvenPoint = projectionData.findIndex(d => d.projectedBalance < 0);
  const hasBreakEven = breakEvenPoint !== -1;
  
  // Ajustamos proyecciones según el tipo seleccionado
  const getModifiedProjections = () => {
    const multiplier = {
      optimistic: { income: 1.15, expense: 0.95 },
      conservative: { income: 1.0, expense: 1.0 },
      pessimistic: { income: 0.85, expense: 1.1 }
    }[projectionType];
    
    return projectionData.map(data => ({
      ...data,
      projectedIncome: data.projectedIncome * multiplier.income,
      projectedExpense: data.projectedExpense * multiplier.expense,
      projectedBalance: data.projectedIncome * multiplier.income - data.projectedExpense * multiplier.expense
    }));
  };

  const modifiedProjections = getModifiedProjections();
  
  // Datos para el gráfico de áreas con acumulado
  const cumulativeData = modifiedProjections.reduce((acc, curr) => {
    const lastValue = acc.length > 0 ? acc[acc.length - 1].accumulated : safeCurrentData.balance;
    const newAccumulated = lastValue + (curr.projectedIncome - curr.projectedExpense);
    
    return [...acc, {
      ...curr,
      accumulated: newAccumulated
    }];
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Proyecciones Financieras</h2>
          <p className="text-muted-foreground">Estimación de flujo de caja para los próximos meses</p>
        </div>
        
        <div className="flex gap-3">
          <Select value={projectionType} onValueChange={setProjectionType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo de proyección" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="optimistic">Optimista</SelectItem>
              <SelectItem value="conservative">Conservadora</SelectItem>
              <SelectItem value="pessimistic">Pesimista</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={projectionScope} onValueChange={setProjectionScope}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Alcance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">3 meses</SelectItem>
              <SelectItem value="6m">6 meses</SelectItem>
              <SelectItem value="12m">12 meses</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid md:grid-cols-4 gap-4">
        <Card className={runwayMonths < 3 ? "bg-red-50" : runwayMonths < 6 ? "bg-amber-50" : "bg-green-50"}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Runway Proyectado</CardTitle>
              <Clock className={`h-5 w-5 ${runwayMonths < 3 ? "text-red-500" : runwayMonths < 6 ? "text-amber-500" : "text-green-500"}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isRunwayInfinite ? "∞" : `${runway} meses`}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isRunwayInfinite 
                ? "MRR actual cubre los gastos" 
                : hasBreakEven 
                  ? `Quiebre estimado: ${projectionData[breakEvenPoint].month} ${projectionData[breakEvenPoint].year}` 
                  : "Sin quiebre en el período proyectado"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ingresos Proyectados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(modifiedProjections.reduce((sum, data) => sum + data.projectedIncome, 0))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Próximos {projectionScope === '3m' ? '3' : projectionScope === '6m' ? '6' : '12'} meses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Gastos Proyectados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(modifiedProjections.reduce((sum, data) => sum + data.projectedExpense, 0))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Próximos {projectionScope === '3m' ? '3' : projectionScope === '6m' ? '6' : '12'} meses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Balance Proyectado</CardTitle>
              {modifiedProjections.reduce((sum, data) => sum + (data.projectedIncome - data.projectedExpense), 0) >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${modifiedProjections.reduce((sum, data) => sum + (data.projectedIncome - data.projectedExpense), 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(modifiedProjections.reduce((sum, data) => sum + (data.projectedIncome - data.projectedExpense), 0))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {modifiedProjections.reduce((sum, data) => sum + (data.projectedIncome - data.projectedExpense), 0) >= 0 
                ? "Flujo positivo" 
                : "Flujo negativo"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="cash-flow" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cash-flow">Flujo de Caja</TabsTrigger>
          <TabsTrigger value="monthly">Ingresos vs Gastos</TabsTrigger>
          <TabsTrigger value="accumulated">Saldo Acumulado</TabsTrigger>
        </TabsList>

        <TabsContent value="cash-flow">
          <Card>
            <CardHeader>
              <CardTitle>Proyección de Flujo de Caja</CardTitle>
              <CardDescription>Ingresos menos gastos proyectados por mes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={modifiedProjections.slice(0, projectionScope === '3m' ? 3 : projectionScope === '6m' ? 6 : 12)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${value / 1000000}M`} />
                    <Tooltip 
                      formatter={(value, name) => {
                        const formattedValue = formatCurrency(Number(value));
                        if (name === "projectedIncome") return [formattedValue, "Ingresos"];
                        if (name === "projectedExpense") return [formattedValue, "Gastos"];
                        if (name === "projectedBalance") return [formattedValue, "Balance"];
                        return [formattedValue, name];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="projectedIncome" name="Ingresos" fill="#4ade80" />
                    <Bar dataKey="projectedExpense" name="Gastos" fill="#f87171" />
                    <ReferenceLine y={0} stroke="#000" />
                    <Line
                      type="monotone"
                      dataKey="projectedBalance"
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
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Comparativa Mensual</CardTitle>
              <CardDescription>Evolución de ingresos y gastos por mes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      {
                        month: "Actual",
                        ingresos: currentData.ingresos,
                        gastos: currentData.gastos
                      },
                      ...modifiedProjections.slice(0, projectionScope === '3m' ? 3 : projectionScope === '6m' ? 6 : 12).map(data => ({
                        month: data.month,
                        ingresos: data.projectedIncome,
                        gastos: data.projectedExpense
                      }))
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${value / 1000000}M`} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="ingresos"
                      name="Ingresos"
                      stroke="#4ade80"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="gastos"
                      name="Gastos"
                      stroke="#f87171"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accumulated">
          <Card>
            <CardHeader>
              <CardTitle>Saldo Acumulado Proyectado</CardTitle>
              <CardDescription>Evolución del saldo disponible</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { month: "Actual", accumulated: currentData.balance },
                      ...cumulativeData.slice(0, projectionScope === '3m' ? 3 : projectionScope === '6m' ? 6 : 12)
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${value / 1000000}M`} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <ReferenceLine y={0} stroke="red" strokeDasharray="3 3" />
                    <Area
                      type="monotone"
                      dataKey="accumulated"
                      name="Saldo"
                      stroke="#4b4ce6"
                      fill="url(#colorAccumulated)"
                      activeDot={{ r: 8 }}
                    />
                    <defs>
                      <linearGradient id="colorAccumulated" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4b4ce6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#4b4ce6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {runwayMonths < 6 && !isRunwayInfinite && (
                <div className="mt-4 bg-amber-50 border border-amber-200 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-amber-500 h-5 w-5 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800">Alerta de Runway</h4>
                      <p className="text-sm text-amber-700 mt-1">
                        Tu saldo actual se agotará en aproximadamente {runway} meses al ritmo de gasto actual. 
                        {runwayMonths < 3 ? " Se recomienda acción inmediata para aumentar ingresos o reducir gastos." : 
                         " Considera estrategias para mejorar el flujo de caja."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Escenarios</CardTitle>
          <CardDescription>Comparación de resultados según diferentes proyecciones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" type="category" allowDuplicatedCategory={false} />
                <YAxis tickFormatter={(value) => `$${value / 1000000}M`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                
                {["optimistic", "conservative", "pessimistic"].map((scenario, index) => {
                  const multiplier = {
                    optimistic: { income: 1.15, expense: 0.95 },
                    conservative: { income: 1.0, expense: 1.0 },
                    pessimistic: { income: 0.85, expense: 1.1 }
                  }[scenario];
                  
                  const scenarioData = [
                    { month: "Actual", accumulated: currentData.balance },
                    ...projectionData.slice(0, projectionScope === '3m' ? 3 : projectionScope === '6m' ? 6 : 12).reduce((acc, curr, i) => {
                      const lastValue = acc.length > 0 ? acc[acc.length - 1].accumulated : currentData.balance;
                      const projIncome = curr.projectedIncome * multiplier.income;
                      const projExpense = curr.projectedExpense * multiplier.expense;
                      const newAccumulated = lastValue + (projIncome - projExpense);
                      
                      return [...acc, {
                        month: curr.month,
                        accumulated: newAccumulated
                      }];
                    }, [])
                  ];
                  
                  const colors = ["#4ade80", "#60a5fa", "#f87171"];
                  const scenarioNames = ["Optimista", "Conservador", "Pesimista"];
                  
                  return (
                    <Line
                      key={scenario}
                      data={scenarioData}
                      type="monotone"
                      dataKey="accumulated"
                      name={scenarioNames[index]}
                      stroke={colors[index]}
                      strokeWidth={scenario === projectionType ? 3 : 1.5}
                      dot={scenario === projectionType ? { r: 4 } : { r: 2 }}
                      activeDot={{ r: 8 }}
                      connectNulls
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-green-50 p-3 rounded-lg">
              <h5 className="font-medium mb-1">Escenario Optimista</h5>
              <p className="text-muted-foreground">
                +15% ingresos, -5% gastos
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <h5 className="font-medium mb-1">Escenario Conservador</h5>
              <p className="text-muted-foreground">
                Mantiene tendencias actuales
              </p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <h5 className="font-medium mb-1">Escenario Pesimista</h5>
              <p className="text-muted-foreground">
                -15% ingresos, +10% gastos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
