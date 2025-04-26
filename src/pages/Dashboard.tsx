
import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { 
  CircleDollarSign, 
  CreditCard, 
  TrendingUp, 
  Users, 
  Briefcase, 
  ChartLine,
  PieChart
} from "lucide-react";
import { useDashboardData, TimePeriod } from "@/hooks/use-dashboard-data";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinancialKPIs } from "@/hooks/use-financial-kpis";
import { normalizeMonthlyData } from "@/utils/financial-calculations";

const COLORS = ['#4ade80', '#f87171', '#60a5fa', '#fbbf24', '#a78bfa', '#fb923c'];

const Dashboard = () => {
  const [timeFrame, setTimeFrame] = useState<TimePeriod>('month');
  const { 
    metrics, 
    monthlyData, 
    clientData, 
    expenseData, 
    isLoading 
  } = useDashboardData(timeFrame);
  
  // Explicitly exclude partner contributions for operational income
  const operationalIncome = metrics.currentMonthIncome;
  
  // Calculate better financial KPIs
  const financialKPIsOptions = {
    totalIncome: metrics.currentMonthIncome,
    totalExpense: metrics.currentMonthExpense,
    operationalIncome: operationalIncome,
    previousIncome: metrics.previousMonthIncome,
    previousExpense: metrics.previousMonthExpense,
    previousOperationalIncome: metrics.previousMonthIncome,
    cashBalance: metrics.cashBalance,
    burnRate: metrics.burnRate,
    marketingExpense: expenseData.find(cat => cat.category === 'Marketing')?.total || 0,
    activeClients: metrics.activeClients,
    previousActiveClients: metrics.previousActiveClients,
    activeProjects: metrics.activeProjects || 0,
    recurringPayments: [], // This should be populated from the hook
  };

  const { kpis } = useFinancialKPIs(financialKPIsOptions);

  // Normalize monthly data for charts
  const chartData = normalizeMonthlyData(monthlyData);

  // Handle time frame change
  const handleTimeFrameChange = (newTimeFrame: TimePeriod) => {
    setTimeFrame(newTimeFrame);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Financiero"
        description="Vista general del estado financiero"
      />
      
      {/* Time Period Selector */}
      <div className="flex justify-end mb-6">
        <Select value={timeFrame} onValueChange={(value) => handleTimeFrameChange(value as TimePeriod)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Este Mes</SelectItem>
            <SelectItem value="prev-month">Mes Anterior</SelectItem>
            <SelectItem value="quarter">Este Trimestre</SelectItem>
            <SelectItem value="prev-quarter">Trimestre Anterior</SelectItem>
            <SelectItem value="ytd">Año a la Fecha</SelectItem>
            <SelectItem value="year">Este Año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Resumen General</TabsTrigger>
          <TabsTrigger value="financial-health">Salud Financiera</TabsTrigger>
          <TabsTrigger value="operational-health">Salud Operacional</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="space-y-6">
            {/* KPI Cards - Top Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Ingresos Operacionales"
                value={formatCurrency(kpis.mrr.value, "COP")}
                trend={kpis.mrr.trend}
                trendValue={`${metrics.monthlyVariation.income.percentage > 0 ? "+" : ""}${metrics.monthlyVariation.income.percentage.toFixed(1)}%`}
                icon={<CircleDollarSign className="h-4 w-4" />}
              />
              <StatsCard
                title="Gastos"
                value={formatCurrency(kpis.burnRate.value, "COP")}
                trend={kpis.burnRate.trend === "up" ? "down" : (kpis.burnRate.trend === "down" ? "up" : "neutral")}
                trendValue={`${metrics.monthlyVariation.expense.percentage > 0 ? "+" : ""}${metrics.monthlyVariation.expense.percentage.toFixed(1)}%`}
                icon={<CreditCard className="h-4 w-4" />}
              />
              <StatsCard
                title="Saldo en Caja"
                value={formatCurrency(kpis.cashBalance.value, "COP")}
                trend={kpis.cashBalance.trend}
                trendValue={`${((kpis.cashBalance.value / (kpis.mrr.value || 1)) * 100).toFixed(0)}% MRR`}
                icon={<TrendingUp className="h-4 w-4" />}
              />
              <StatsCard
                title="Runway"
                value={`${kpis.runway.value === Infinity || isNaN(kpis.runway.value) ? "∞" : kpis.runway.value.toFixed(1)} meses`}
                trend={kpis.runway.trend}
                trendValue={kpis.runway.value > 6 ? "Saludable" : "Requiere atención"}
                icon={<ChartLine className="h-4 w-4" />}
              />
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Income vs Expense Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Ingresos vs Gastos</CardTitle>
                  <CardDescription>Evolución mensual de finanzas operacionales</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {chartData && chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={chartData} 
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`} />
                          <Tooltip formatter={(value) => formatCurrency(Number(value), "COP")} />
                          <Legend />
                          <Bar dataKey="ingresos" name="Ingresos" fill="#4ade80" />
                          <Bar dataKey="gastos" name="Gastos" fill="#f87171" />
                          <Line type="monotone" dataKey="balance" name="Balance" stroke="#60a5fa" strokeWidth={2} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No hay datos suficientes para mostrar
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Cash Flow Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Evolución de Caja</CardTitle>
                  <CardDescription>Flujo acumulado y tendencia</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {chartData && chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={chartData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`} />
                          <Tooltip formatter={(value) => formatCurrency(Number(value), "COP")} />
                          <Area 
                            type="monotone" 
                            dataKey="balance" 
                            name="Saldo Acumulado" 
                            stroke="#60a5fa" 
                            fillOpacity={1}
                            fill="url(#colorBalance)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No hay datos suficientes para mostrar
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Distribution Charts Row */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Client Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Ingresos</CardTitle>
                  <CardDescription>Ingresos por cliente</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {clientData && clientData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={clientData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {clientData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(Number(value), "COP")} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No hay datos suficientes para mostrar
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Expense Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Gastos</CardTitle>
                  <CardDescription>Gastos por categoría</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {expenseData && expenseData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={expenseData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="category"
                            label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {expenseData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(Number(value), "COP")} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No hay datos suficientes para mostrar
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Financial Health Tab */}
        <TabsContent value="financial-health">
          <div className="space-y-6">
            {/* Financial KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="MRR"
                value={formatCurrency(kpis.mrr.value, "COP")}
                trend={kpis.mrr.trend}
                trendValue={kpis.mrr.value > 0 ? `${((kpis.mrr.value / (kpis.burnRate.value || 1)) * 100).toFixed(0)}% de costos fijos` : "0%"}
                icon={<CircleDollarSign className="h-4 w-4" />}
              />
              <StatsCard
                title="ARR"
                value={formatCurrency(kpis.arr.value, "COP")}
                trend={kpis.arr.trend}
                trendValue={`Anualizado`}
                icon={<CircleDollarSign className="h-4 w-4" />}
              />
              <StatsCard
                title="Margen de Utilidad"
                value={`${kpis.profitMargin.value.toFixed(1)}%`}
                trend={kpis.profitMargin.trend}
                trendValue={kpis.profitMargin.trendValue ? `${kpis.profitMargin.trendValue.toFixed(1)}%` : undefined}
                icon={<PieChart className="h-4 w-4" />}
              />
              <StatsCard
                title={kpis.marketingROI ? "ROI Marketing" : "LTV"}
                value={kpis.marketingROI ? `${kpis.marketingROI.value.toFixed(1)}x` : formatCurrency(kpis.ltv.value, "COP")}
                trend={kpis.marketingROI ? kpis.marketingROI.trend : kpis.ltv.trend}
                trendValue={kpis.marketingROI ? "Retorno por peso invertido" : "Valor de vida del cliente"}
                icon={<ChartLine className="h-4 w-4" />}
              />
            </div>

            {/* Extended Financial KPIs */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Burn Rate Mensual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(kpis.burnRate.value, "COP")}</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Promedio de gastos mensuales de los últimos 6 meses
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Variación de Ingresos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${kpis.incomeVariation.value >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {kpis.incomeVariation.value > 0 ? "+" : ""}{kpis.incomeVariation.value.toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Comparado con el período anterior
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Ticket Promedio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(kpis.averageTicket.value, "COP")}</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Ingreso promedio mensual por cliente
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Income Statement */}
            <Card>
              <CardHeader>
                <CardTitle>Estado de Resultados Simplificado</CardTitle>
                <CardDescription>Período: {timeFrame === 'month' ? 'Este Mes' : timeFrame === 'year' ? 'Este Año' : 'Seleccionado'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 py-2 border-b">
                    <span className="font-medium">Ingresos Operacionales</span>
                    <span className="text-right">{formatCurrency(operationalIncome, "COP")}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 py-2 border-b">
                    <span className="font-medium">Gastos Totales</span>
                    <span className="text-right">{formatCurrency(metrics.currentMonthExpense, "COP")}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 py-2 border-b">
                    <span className="font-medium">Utilidad Bruta</span>
                    <span className={`text-right ${operationalIncome - metrics.currentMonthExpense >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(operationalIncome - metrics.currentMonthExpense, "COP")}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 py-2 border-b">
                    <span className="font-medium">Impuestos</span>
                    <span className="text-right">{formatCurrency(0, "COP")}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 py-2 font-bold">
                    <span>Utilidad Neta</span>
                    <span className={`text-right ${operationalIncome - metrics.currentMonthExpense >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(operationalIncome - metrics.currentMonthExpense, "COP")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Operational Health Tab */}
        <TabsContent value="operational-health">
          <div className="space-y-6">
            {/* Operational KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Clientes Activos"
                value={kpis.activeClients.value.toString()}
                trend={kpis.activeClients.trend}
                trendValue={kpis.activeClients.trendValue ? `${kpis.activeClients.trendValue > 0 ? "+" : ""}${kpis.activeClients.trendValue.toFixed(1)}%` : undefined}
                icon={<Users className="h-4 w-4" />}
              />
              <StatsCard
                title="Proyectos Activos"
                value={kpis.activeProjects.value.toString()}
                trend={kpis.activeProjects.trend}
                trendValue=""
                icon={<Briefcase className="h-4 w-4" />}
              />
              <StatsCard
                title="Proyectos por Cliente"
                value={kpis.projectsPerClient.value.toFixed(1)}
                trend={kpis.projectsPerClient.trend}
                trendValue=""
                icon={<Briefcase className="h-4 w-4" />}
              />
              <StatsCard
                title="Ticket Promedio"
                value={formatCurrency(kpis.averageTicket.value, "COP")}
                trend={kpis.averageTicket.trend}
                trendValue="Por cliente activo"
                icon={<CircleDollarSign className="h-4 w-4" />}
              />
            </div>

            {/* Client Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Clientes por Ingresos</CardTitle>
                <CardDescription>Distribución de ingresos por cliente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  {clientData && clientData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={clientData.sort((a, b) => b.value - a.value)}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip formatter={(value) => formatCurrency(Number(value), "COP")} />
                        <Bar dataKey="value" name="Ingresos" fill="#4ade80" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No hay datos de clientes para mostrar
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Active Projects Table */}
            <Card>
              <CardHeader>
                <CardTitle>Clientes y Proyectos Activos</CardTitle>
                <CardDescription>Resumen de estado actual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-3 bg-muted/50 p-3 font-medium">
                    <div>Cliente</div>
                    <div className="text-center">Proyectos</div>
                    <div className="text-right">Ingresos</div>
                  </div>

                  {clientData && clientData.length > 0 ? (
                    clientData.slice(0, 5).map((client, i) => (
                      <div key={i} className="grid grid-cols-3 p-3 border-t">
                        <div className="truncate">{client.name}</div>
                        <div className="text-center">
                          {Math.round(kpis.projectsPerClient.value)} {/* Simplified example */}
                        </div>
                        <div className="text-right">{formatCurrency(client.value, "COP")}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-muted-foreground">
                      No hay datos de clientes para mostrar
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
