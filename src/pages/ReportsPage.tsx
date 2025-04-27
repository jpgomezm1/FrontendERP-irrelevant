import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { Download, Calendar, ChevronDown, ChevronUp, Info, TrendingUp, TrendingDown, AlertTriangle, BarChart4, PieChart, LineChart } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  LineChart as RechartLineChart, 
  Line, 
  PieChart as RechartPieChart, 
  Pie, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell 
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useFinancialReports, ReportPeriod } from "@/hooks/use-financial-reports";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// Color palette for charts
const COLORS = ['#a855f7', '#d8b4fe', '#c084fc', '#9333ea', '#7e22ce', '#6b21a8', '#8b5cf6', '#c026d3', '#e879f9'];

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 6)),
    to: new Date(),
  });
  
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("semestral");
  const { metrics, isLoading } = useFinancialReports(
    reportPeriod, 
    dateRange ? { from: dateRange.from as Date, to: dateRange.to as Date } : undefined
  );

  const renderNoDataMessage = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center text-white">
      <AlertTriangle className="h-12 w-12 text-amber-400 mb-4" />
      <h3 className="text-lg font-medium mb-2 text-white">No hay datos para el período seleccionado</h3>
      <p className="text-slate-300 max-w-md">
        Intenta seleccionar un rango de fechas diferente o verifica que existan transacciones pagadas en el sistema.
      </p>
    </div>
  );

  const renderLoading = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#1e1756] border-purple-800/30">
          <CardHeader>
            <Skeleton className="h-6 w-3/4 bg-purple-800/30" />
            <Skeleton className="h-4 w-1/2 bg-purple-800/30" />
          </CardHeader>
          <CardContent>
            <div className="h-[350px] flex items-center justify-center">
              <Skeleton className="h-full w-full bg-purple-800/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1e1756] border-purple-800/30">
          <CardHeader>
            <Skeleton className="h-6 w-3/4 bg-purple-800/30" />
            <Skeleton className="h-4 w-1/2 bg-purple-800/30" />
          </CardHeader>
          <CardContent>
            <div className="h-[350px] flex items-center justify-center">
              <Skeleton className="h-full w-full bg-purple-800/30" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="text-white">
      <PageHeader
        title="Reportes Financieros"
        description="Análisis detallado de la situación financiera de la empresa"
      >
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[300px] justify-start text-left font-normal bg-transparent border-purple-800/30 text-white hover:bg-[#0f0b2a]",
                  !dateRange && "text-slate-400"
                )}
              >
                <Calendar className="mr-2 h-4 w-4 text-purple-400" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, yyyy", { locale: es })} -{" "}
                      {format(dateRange.to, "LLL dd, yyyy", { locale: es })}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, yyyy", { locale: es })
                  )
                ) : (
                  <span>Seleccionar rango de fechas</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[#1e1756] border-purple-800/30" align="start">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                className={cn("p-3 pointer-events-auto bg-[#1e1756]")}
              />
            </PopoverContent>
          </Popover>

          <Select
            value={reportPeriod}
            onValueChange={(value) => setReportPeriod(value as ReportPeriod)}
          >
            <SelectTrigger className="w-[180px] bg-transparent border-purple-800/30 text-white">
              <SelectValue placeholder="Seleccionar periodo" />
            </SelectTrigger>
            <SelectContent className="bg-[#1e1756] border-purple-800/30 text-white">
              <SelectItem value="mensual">Mensual</SelectItem>
              <SelectItem value="trimestral">Trimestral</SelectItem>
              <SelectItem value="semestral">Semestral</SelectItem>
              <SelectItem value="anual">Anual</SelectItem>
              <SelectItem value="personalizado">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PageHeader>

      <Tabs defaultValue="resumen" className="text-white">
        <TabsList className="mb-4 bg-[#0f0b2a] border border-purple-800/30">
          <TabsTrigger value="resumen" className="data-[state=active]:bg-purple-800/50 data-[state=active]:text-white flex gap-2 items-center">
            <BarChart4 className="h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="edoResultados" className="data-[state=active]:bg-purple-800/50 data-[state=active]:text-white flex gap-2 items-center">
            <LineChart className="h-4 w-4" />
            Estado de Resultados
          </TabsTrigger>
          <TabsTrigger value="indicadores" className="data-[state=active]:bg-purple-800/50 data-[state=active]:text-white flex gap-2 items-center">
            <PieChart className="h-4 w-4" />
            Indicadores Financieros
          </TabsTrigger>
        </TabsList>

        {/* Tab de Resumen (Dashboard) */}
        <TabsContent value="resumen">
          {isLoading ? (
            renderLoading()
          ) : metrics.monthly_data.length === 0 ? (
            renderNoDataMessage()
          ) : (
            <div className="grid gap-6">
              {/* Quick KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-[#1e1756] border-purple-800/30 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-300">
                      Ingresos Totales
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(metrics.total_income, "COP")}
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      {dateRange && `${format(dateRange.from as Date, "LLL dd", { locale: es })} - ${format(dateRange.to as Date, "LLL dd, yyyy", { locale: es })}`}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-[#1e1756] border-purple-800/30 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-300">
                      Gastos Totales
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(metrics.total_expense, "COP")}
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      {dateRange && `${format(dateRange.from as Date, "LLL dd", { locale: es })} - ${format(dateRange.to as Date, "LLL dd, yyyy", { locale: es })}`}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-[#1e1756] border-purple-800/30 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-300">
                      Utilidad Neta
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${metrics.net_income >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {formatCurrency(metrics.net_income, "COP")}
                    </div>
                    <div className="flex items-center text-xs mt-1">
                      {metrics.net_income >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-400 mr-1" />
                      )}
                      <span className="text-slate-300">
                        {metrics.total_income > 0 
                          ? `${((metrics.net_income / metrics.total_income) * 100).toFixed(1)}% de ingresos`
                          : "0% de ingresos"}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1e1756] border-purple-800/30 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-300">
                      Saldo de Caja
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${metrics.accumulated_balance >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {formatCurrency(metrics.accumulated_balance, "COP")}
                    </div>
                    <div className="flex items-center text-xs mt-1">
                      <span className="text-slate-300">
                        {metrics.burn_rate > 0
                          ? `${metrics.cash_flow_runway.toFixed(1)} meses de operación`
                          : "N/A"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-[#1e1756] border-purple-800/30 text-white">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart4 className="h-5 w-5 text-purple-400" />
                      Ingresos vs Gastos
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Comparativa mensual de ingresos, gastos y utilidad
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={metrics.monthly_data}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#2e2b70" />
                          <XAxis 
                            dataKey="month" 
                            tickFormatter={(value) => value.substring(0, 3)}
                            stroke="#a5a3c8"
                          />
                          <YAxis 
                            tickFormatter={(value) => `$${value / 1000000}M`} 
                            domain={[0, 'auto']}
                            stroke="#a5a3c8"
                          />
                          <Tooltip 
                            formatter={(value) => [formatCurrency(Number(value), "COP"), ""]} 
                            labelFormatter={(label) => `${label}`}
                            contentStyle={{
                              backgroundColor: "#0f0b2a",
                              borderColor: "#4c1d95",
                              color: "#fff"
                            }}
                          />
                          <Legend />
                          <Bar
                            dataKey="total_income"
                            name="Ingresos"
                            fill="#4ade80"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="total_expense"
                            name="Gastos"
                            fill="#f87171"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="net_income"
                            name="Utilidad"
                            fill="#a78bfa"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1e1756] border-purple-800/30 text-white">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <LineChart className="h-5 w-5 text-purple-400" />
                      Evolución de Caja
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Saldo acumulado en caja a lo largo del tiempo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartLineChart 
                          data={(() => {
                            // Calculate cumulative balance
                            let balance = 0;
                            return metrics.monthly_data.map((month, idx) => {
                              balance += month.net_income;
                              return {
                                ...month,
                                accumulated_balance: balance
                              };
                            });
                          })()}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#2e2b70" />
                          <XAxis 
                            dataKey="month" 
                            tickFormatter={(value) => value.substring(0, 3)}
                            stroke="#a5a3c8"
                          />
                          <YAxis 
                            tickFormatter={(value) => `$${value / 1000000}M`}
                            stroke="#a5a3c8"
                          />
                          <Tooltip 
                            formatter={(value) => [formatCurrency(Number(value), "COP"), ""]} 
                            labelFormatter={(label) => `${label}`}
                            contentStyle={{
                              backgroundColor: "#0f0b2a",
                              borderColor: "#4c1d95",
                              color: "#fff"
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="accumulated_balance"
                            name="Saldo en Caja"
                            stroke="#a78bfa"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </RechartLineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-[#1e1756] border-purple-800/30 text-white">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-purple-400" />
                      Top Clientes por Ingresos
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Distribución de ingresos por cliente
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {metrics.income_by_client.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[350px] text-center">
                        <Info className="h-8 w-8 text-purple-400 mb-2" />
                        <p className="text-slate-300">No hay datos de clientes disponibles</p>
                      </div>
                    ) : (
                      <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartPieChart>
                            <Pie
                              data={metrics.income_by_client}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={120}
                              fill="#8884d8"
                              dataKey="total"
                              nameKey="client"
                              label={({ client, percent }) => 
                                `${client.length > 15 ? client.substring(0, 15) + '...' : client} ${(percent * 100).toFixed(0)}%`}
                            >
                              {metrics.income_by_client.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value) => formatCurrency(Number(value), "COP")}
                              contentStyle={{
                                backgroundColor: "#0f0b2a",
                                borderColor: "#4c1d95",
                                color: "#fff"
                              }}
                            />
                          </RechartPieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-[#1e1756] border-purple-800/30 text-white">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-purple-400" />
                      Gastos por Categoría
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Distribución de gastos por categoría
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {metrics.expense_by_category.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[350px] text-center">
                        <Info className="h-8 w-8 text-purple-400 mb-2" />
                        <p className="text-slate-300">No hay datos de gastos disponibles</p>
                      </div>
                    ) : (
                      <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartPieChart>
                            <Pie
                              data={metrics.expense_by_category}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={120}
                              fill="#8884d8"
                              dataKey="total"
                              nameKey="category"
                              label={({ category, percent }) => 
                                `${category.length > 15 ? category.substring(0, 15) + '...' : category} ${(percent * 100).toFixed(0)}%`}
                            >
                              {metrics.expense_by_category.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value) => formatCurrency(Number(value), "COP")}
                              contentStyle={{
                                backgroundColor: "#0f0b2a",
                                borderColor: "#4c1d95",
                                color: "#fff"
                              }}
                            />
                          </RechartPieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Tab de Estado de Resultados (Income Statement) */}
        <TabsContent value="edoResultados">
          {isLoading ? (
            <Card className="bg-[#1e1756] border-purple-800/30 text-white">
              <CardHeader>
                <Skeleton className="h-7 w-64 bg-purple-800/30" />
                <Skeleton className="h-4 w-40 mt-2 bg-purple-800/30" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-purple-800/30">
                      <Skeleton className="h-4 w-40 bg-purple-800/30" />
                      <Skeleton className="h-4 w-24 bg-purple-800/30" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : metrics.monthly_data.length === 0 ? (
            <Card className="bg-[#1e1756] border-purple-800/30 text-white">
              <CardContent className="pt-6">
                {renderNoDataMessage()}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-[#1e1756] border-purple-800/30 text-white">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-purple-400" />
                  Estado de Resultados
                </CardTitle>
                <CardDescription className="text-slate-300">
                  {dateRange && `${format(dateRange.from as Date, "LLL dd, yyyy", { locale: es })} - ${format(dateRange.to as Date, "LLL dd, yyyy", { locale: es })}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* Ingresos */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-white">Ingresos</h3>
                    <div className="space-y-2">
                      {metrics.income_by_client.length > 0 ? (
                        <>
                          {metrics.income_by_client.map((client, index) => (
                            <div key={index} className="flex justify-between py-2 border-b border-purple-800/30">
                              <span className="text-white">{client.client}</span>
                              <span className="text-green-400">{formatCurrency(client.total, "COP")}</span>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="flex justify-between py-2 border-b border-purple-800/30 text-slate-400 italic">
                          <span>No hay ingresos registrados</span>
                          <span>{formatCurrency(0, "COP")}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-2 font-bold">
                        <span className="text-white">Total Ingresos</span>
                        <span className="text-green-400">{formatCurrency(metrics.total_income, "COP")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Gastos */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-white">Gastos</h3>
                    <div className="space-y-2">
                      {metrics.expense_by_category.length > 0 ? (
                        <>
                          {metrics.expense_by_category.map((category, index) => (
                            <div key={index} className="flex justify-between py-2 border-b border-purple-800/30">
                              <span className="text-white">{category.category}</span>
                              <span className="text-red-400">{formatCurrency(category.total, "COP")}</span>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="flex justify-between py-2 border-b border-purple-800/30 text-slate-400 italic">
                          <span>No hay gastos registrados</span>
                          <span>{formatCurrency(0, "COP")}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-2 font-bold">
                        <span className="text-white">Total Gastos</span>
                        <span className="text-red-400">{formatCurrency(metrics.total_expense, "COP")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Resultados */}
                  <div className="pt-4 border-t-2 border-purple-800/30">
                    <div className="flex justify-between py-2 text-lg font-bold">
                      <span className="text-white">Utilidad Bruta</span>
                      <span className={metrics.net_income >= 0 ? "text-green-400" : "text-red-400"}>
                        {formatCurrency(metrics.net_income, "COP")}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-purple-800/30">
                      <span className="text-white">Impuestos</span>
                      <span className="text-slate-300">{formatCurrency(0, "COP")}</span>
                    </div>
                    <div className="flex justify-between py-4 text-xl font-bold">
                      <span className="text-white">Utilidad Neta</span>
                      <span className={metrics.net_income >= 0 ? "text-green-400" : "text-red-400"}>
                        {formatCurrency(metrics.net_income, "COP")}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar a Excel
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        {/* Tab de Indicadores Financieros (Financial KPIs) */}
        <TabsContent value="indicadores">
          {isLoading ? (
            renderLoading()
          ) : metrics.monthly_data.length === 0 ? (
            <Card className="bg-[#1e1756] border-purple-800/30 text-white">
              <CardContent className="pt-6">
                {renderNoDataMessage()}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-[#1e1756] border-purple-800/30 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white">Margen de Utilidad</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <span className="text-3xl font-bold text-white">
                        {metrics.total_income > 0 
                          ? `${((metrics.net_income / metrics.total_income) * 100).toFixed(1)}%` 
                          : "0%"}
                      </span>
                      {metrics.net_income > 0 ? (
                        <ChevronUp className="h-6 w-6 text-green-400 ml-2" />
                      ) : (
                        <ChevronDown className="h-6 w-6 text-red-400 ml-2" />
                      )}
                    </div>
                    <p className="text-slate-300 mt-1">
                      Utilidad / Ingresos Totales
                    </p>
                    <div className="mt-4 text-sm">
                      {metrics.monthly_data.length >= 2 && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-300">Mes Anterior:</span>
                            <span className="font-medium text-white">
                              {metrics.monthly_data[1] && metrics.monthly_data[1].total_income > 0
                                ? `${((metrics.monthly_data[1].net_income / metrics.monthly_data[1].total_income) * 100).toFixed(1)}%`
                                : "0%"}
                            </span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-slate-300">Variación:</span>
                            <span className={`font-medium ${
                              metrics.monthly_data[0]?.net_income > metrics.monthly_data[1]?.net_income 
                                ? "text-green-400" 
                                : "text-red-400"
                            }`}>
                              {metrics.monthly_data[1] && metrics.monthly_data[1].total_income > 0
                                ? `${(((metrics.monthly_data[0]?.net_income / metrics.monthly_data[0]?.total_income) - 
                                    (metrics.monthly_data[1]?.net_income / metrics.monthly_data[1]?.total_income)) * 100).toFixed(1)}%`
                                : "0%"}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1e1756] border-purple-800/30 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white">ROI Marketing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const marketingExpense = metrics.expense_by_category.find(
                        cat => cat.category.toLowerCase().includes('marketing')
                      );
                      const roi = marketingExpense && marketingExpense.total > 0
                        ? metrics.total_income / marketingExpense.total
                        : null;
                      
                      return roi !== null ? (
                        <>
                          <div className="flex items-center">
                            <span className="text-3xl font-bold text-white">{roi.toFixed(1)}x</span>
                            <ChevronUp className="h-6 w-6 text-green-400 ml-2" />
                          </div>
                          <p className="text-slate-300 mt-1">
                            Ingresos / Gasto en Marketing
                          </p>
                          <div className="mt-4 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-300">Total Gastado en Marketing:</span>
                              <span className="font-medium text-white">{formatCurrency(marketingExpense.total, "COP")}</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-3xl font-bold text-slate-300">N/A</div>
                          <p className="text-slate-300 mt-1">
                            No hay gastos de marketing registrados
                          </p>
                          <div className="mt-4 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-300">Categorizar gastos como "Marketing" para habilitar</span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>

                <Card className="bg-[#1e1756] border-purple-800/30 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white">Efectivo Disponible</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">
                      {formatCurrency(metrics.accumulated_balance, "COP")}
                    </div>
                    <p className="text-slate-300 mt-1">
                      Saldo acumulado
                    </p>
                    <div className="mt-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-300">Meses de operación cubiertos:</span>
                        <span className="font-medium text-white">
                          {metrics.burn_rate > 0 
                            ? `${metrics.cash_flow_runway.toFixed(1)} meses` 
                            : "∞"}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-slate-300">Burn rate mensual:</span>
                        <span className="font-medium text-white">{formatCurrency(metrics.burn_rate, "COP")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-[#1e1756] border-purple-800/30 text-white">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-400" />
                    Análisis de Tendencias
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Evolución de indicadores clave en el tiempo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartLineChart 
                        data={metrics.monthly_data.map(month => ({
                          ...month,
                          margen: month.total_income > 0 ? (month.net_income / month.total_income) : 0
                        }))}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#2e2b70" />
                        <XAxis 
                          dataKey="month" 
                          tickFormatter={(value) => value.substring(0, 3)}
                          stroke="#a5a3c8"
                        />
                        <YAxis 
                          yAxisId="left" 
                          tickFormatter={(value) => `$${value / 1000000}M`}
                          stroke="#a5a3c8"
                        />
                        <YAxis 
                          yAxisId="right" 
                          orientation="right" 
                          tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                          domain={[0, 1]}
                          stroke="#a5a3c8"
                        />
                        <Tooltip 
                          formatter={(value, name) => {
                            if (name === "margen") {
                              return [`${(Number(value) * 100).toFixed(1)}%`, "Margen"];
                            }
                            return [formatCurrency(Number(value), "COP"), 
                              name === "total_income" ? "Ingresos" : 
                              name === "total_expense" ? "Gastos" : 
                              "Utilidad"];
                          }}
                          labelFormatter={(label) => `${label}`}
                          contentStyle={{
                            backgroundColor: "#0f0b2a",
                            borderColor: "#4c1d95",
                            color: "#fff"
                          }}
                        />
                        <Legend formatter={(value) => 
                          value === "total_income" ? "Ingresos" : 
                          value === "total_expense" ? "Gastos" : 
                          value === "net_income" ? "Utilidad" : 
                          "Margen de Utilidad"
                        }/>
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="total_income"
                          name="total_income"
                          stroke="#4ade80"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="total_expense"
                          name="total_expense"
                          stroke="#f87171"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="net_income"
                          name="net_income"
                          stroke="#a78bfa"
                          strokeWidth={3}
                          dot={{ r: 5 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="margen"
                          name="margen"
                          stroke="#d8b4fe"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </RechartLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-[#1e1756] border-purple-800/30 text-white">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <LineChart className="h-5 w-5 text-purple-400" />
                      Proyección Financiera
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Estimación a 6 meses basada en tendencias actuales
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-white">Ingresos Proyectados</h4>
                          <p className="text-slate-300 text-sm">Próximos 6 meses</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-white">{formatCurrency(metrics.burn_rate > 0 ? metrics.total_income / metrics.monthly_data.length * 6 : 0, "COP")}</p>
                          {metrics.monthly_data.length > 1 && (
                            <p className="text-sm text-green-400">
                              {metrics.total_income > metrics.total_expense ? "+ " : ""}
                              {((metrics.net_income / metrics.total_expense) * 100).toFixed(1)}% vs periodo anterior
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-white">Gastos Proyectados</h4>
                          <p className="text-slate-300 text-sm">Próximos 6 meses</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-white">{formatCurrency(metrics.burn_rate * 6, "COP")}</p>
                          {metrics.monthly_data.length > 1 && (
                            <p className="text-sm text-slate-300">
                              Basado en el promedio mensual actual
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-purple-800/30">
                        <div>
                          <h4 className="font-medium text-white">Utilidad Proyectada</h4>
                          <p className="text-slate-300 text-sm">Próximos 6 meses</p>
                        </div>
                        <div className="text-right">
                          {(() => {
                            const projectedIncome = metrics.burn_rate > 0 ? metrics.total_income / metrics.monthly_data.length * 6 : 0;
                            const projectedExpenses = metrics.burn_rate * 6;
                            const projectedNetIncome = projectedIncome - projectedExpenses;
                            
                            return (
                              <>
                                <p className={`text-xl font-bold ${projectedNetIncome >= 0 ? "text-green-400" : "text-red-400"}`}>
                                  {formatCurrency(projectedNetIncome, "COP")}
                                </p>
                                {metrics.monthly_data.length > 1 && (
                                  <p className={`text-sm ${projectedNetIncome >= 0 ? "text-green-400" : "text-red-400"}`}>
                                    {projectedNetIncome >= 0 ? "Rentable" : "Pérdida proyectada"}
                                  </p>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1e1756] border-purple-800/30 text-white">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Info className="h-5 w-5 text-purple-400" />
                      Recomendaciones
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Acciones sugeridas basadas en indicadores
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {metrics.net_income < 0 && (
                        <div className="p-3 bg-red-900/20 rounded-md border border-red-800/30">
                          <h4 className="font-medium text-red-300 mb-1">Pérdida Operativa</h4>
                          <p className="text-sm text-red-200">
                            Los gastos superan los ingresos en el período seleccionado.
                            Considerar reducir gastos o incrementar actividades generadoras de ingresos.
                          </p>
                        </div>
                      )}
                      
                      {metrics.burn_rate > 0 && metrics.cash_flow_runway < 3 && (
                        <div className="p-3 bg-amber-900/20 rounded-md border border-amber-800/30">
                          <h4 className="font-medium text-amber-300 mb-1">Riesgo de Liquidez</h4>
                          <p className="text-sm text-amber-200">
                            El saldo actual solo cubre {metrics.cash_flow_runway.toFixed(1)} meses de operación.
                            Priorizar acciones para mejorar el flujo de ingresos o reducir gastos.
                          </p>
                        </div>
                      )}
                      
                      {metrics.income_by_client.length > 0 && 
                       metrics.income_by_client[0].total / metrics.total_income > 0.5 && (
                        <div className="p-3 bg-blue-900/20 rounded-md border border-blue-800/30">
                          <h4 className="font-medium text-blue-300 mb-1">Diversificación de Clientes</h4>
                          <p className="text-sm text-blue-200">
                            El {((metrics.income_by_client[0].total / metrics.total_income) * 100).toFixed(0)}% 
                            de los ingresos proviene de {metrics.income_by_client[0].client}. Buscar
                            oportunidades para reducir la dependencia de un solo cliente.
                          </p>
                        </div>
                      )}
                      
                      {metrics.expense_by_category.length > 0 && (
                        <div className="p-3 bg-green-900/20 rounded-md border border-green-800/30">
                          <h4 className="font-medium text-green-300 mb-1">Optimización de Gastos</h4>
                          <p className="text-sm text-green-200">
                            La categoría principal de gastos es "{metrics.expense_by_category[0].category}" 
                            ({((metrics.expense_by_category[0].total / metrics.total_expense) * 100).toFixed(0)}% del total).
                            Analizar si hay oportunidades de optimización en esta área.
                          </p>
                        </div>
                      )}
                      
                      {metrics.net_income > 0 && metrics.cash_flow_runway > 6 && (
                        <div className="p-3 bg-purple-900/20 rounded-md border border-purple-800/30">
                          <h4 className="font-medium text-purple-300 mb-1">Oportunidad de Inversión</h4>
                          <p className="text-sm text-purple-200">
                            La posición financiera es sólida con {metrics.cash_flow_runway.toFixed(1)} meses de operación cubiertos.
                            Considerar inversiones estratégicas para el crecimiento del negocio.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;