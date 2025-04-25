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
import { Download, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { CalendarIcon } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useFinancialReports, ReportPeriod } from "@/hooks/use-financial-reports";

// Paleta de colores para gráficos
const COLORS = ['#4b4ce6', '#4ade80', '#f87171', '#facc15', '#60a5fa', '#c084fc', '#2dd4bf'];

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2023, 0, 1), // 1 de enero de 2023
    to: new Date(2023, 5, 30),  // 30 de junio de 2023
  });
  
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("semestral");
  const { metrics, isLoading } = useFinancialReports(reportPeriod);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Reportes Financieros"
        description="Análisis detallado de la situación financiera de la empresa"
      >
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
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
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          <Select
            value={reportPeriod}
            onValueChange={(value) => setReportPeriod(value as ReportPeriod)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mensual">Mensual</SelectItem>
              <SelectItem value="trimestral">Trimestral</SelectItem>
              <SelectItem value="semestral">Semestral</SelectItem>
              <SelectItem value="anual">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PageHeader>

      <Tabs defaultValue="resumen">
        <TabsList className="mb-4">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="edoResultados">Estado de Resultados</TabsTrigger>
          <TabsTrigger value="indicadores">Indicadores</TabsTrigger>
        </TabsList>

        {/* Tab de Resumen */}
        <TabsContent value="resumen">
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ingresos vs Gastos</CardTitle>
                  <CardDescription>
                    Comparativa mensual de ingresos, gastos y utilidad
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={metrics.monthly_data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `$${value / 1000000}M`} />
                        <Tooltip formatter={(value) => [formatCurrency(Number(value)), ""]} />
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
                          fill="#4b4ce6"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Evolución de Caja</CardTitle>
                  <CardDescription>
                    Saldo acumulado en caja a lo largo del tiempo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={metrics.monthly_data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `$${value / 1000000}M`} />
                        <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Saldo"]} />
                        <Line
                          type="monotone"
                          dataKey="net_income"
                          name="Saldo en Caja"
                          stroke="#4b4ce6"
                          strokeWidth={3}
                          dot={{ r: 5 }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Clientes por Ingresos</CardTitle>
                  <CardDescription>
                    Distribución de ingresos por cliente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={metrics.income_by_client}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="total"
                          nameKey="client"
                          label={({ client, percent }) => `${client} ${(percent * 100).toFixed(0)}%`}
                        >
                          {metrics.income_by_client.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gastos por Categoría</CardTitle>
                  <CardDescription>
                    Distribución de gastos por categoría
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={metrics.expense_by_category}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="total"
                          nameKey="category"
                          label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                        >
                          {metrics.expense_by_category.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab de Estado de Resultados */}
        <TabsContent value="edoResultados">
          <Card>
            <CardHeader>
              <CardTitle>Estado de Resultados</CardTitle>
              <CardDescription>
                {`${metrics.monthly_data[0]?.month || ''} - ${metrics.monthly_data[metrics.monthly_data.length - 1]?.month || ''} ${metrics.monthly_data[0]?.year || ''}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Ingresos */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Ingresos</h3>
                  <div className="space-y-2">
                    {metrics.income_by_client.slice(0, 3).map((client, index) => (
                      <div key={index} className="flex justify-between py-2 border-b">
                        <span>{client.client}</span>
                        <span>{formatCurrency(client.total)}</span>
                      </div>
                    ))}
                    {metrics.income_by_client.length > 3 && (
                      <div className="flex justify-between py-2 border-b">
                        <span>Otros Clientes</span>
                        <span>{formatCurrency(
                          metrics.income_by_client.slice(3).reduce((sum, client) => sum + client.total, 0)
                        )}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 font-bold">
                      <span>Total Ingresos</span>
                      <span>{formatCurrency(metrics.total_income)}</span>
                    </div>
                  </div>
                </div>

                {/* Gastos */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Gastos</h3>
                  <div className="space-y-2">
                    {metrics.expense_by_category.map((category, index) => (
                      <div key={index} className="flex justify-between py-2 border-b">
                        <span>{category.category}</span>
                        <span>{formatCurrency(category.total)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between py-2 font-bold">
                      <span>Total Gastos</span>
                      <span>{formatCurrency(metrics.total_expense)}</span>
                    </div>
                  </div>
                </div>

                {/* Resultados */}
                <div className="pt-4 border-t-2">
                  <div className="flex justify-between py-2 text-lg font-bold">
                    <span>Utilidad Bruta</span>
                    <span className={metrics.net_income >= 0 ? "text-green-600" : "text-red-600"}>
                      {formatCurrency(metrics.net_income)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Impuestos</span>
                    <span>{formatCurrency(0)}</span>
                  </div>
                  <div className="flex justify-between py-4 text-xl font-bold">
                    <span>Utilidad Neta</span>
                    <span className={metrics.net_income >= 0 ? "text-green-600" : "text-red-600"}>
                      {formatCurrency(metrics.net_income)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Exportar a Excel
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Tab de Indicadores */}
        <TabsContent value="indicadores">
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Margen de Utilidad</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <span className="text-3xl font-bold">
                      {metrics.total_income > 0 
                        ? `${((metrics.net_income / metrics.total_income) * 100).toFixed(1)}%` 
                        : "0%"}
                    </span>
                    {metrics.net_income > 0 ? (
                      <ChevronUp className="h-6 w-6 text-green-500 ml-2" />
                    ) : (
                      <ChevronDown className="h-6 w-6 text-red-500 ml-2" />
                    )}
                  </div>
                  <p className="text-muted-foreground mt-1">
                    Utilidad / Ingresos Totales
                  </p>
                  <div className="mt-4 text-sm">
                    <div className="flex justify-between">
                      <span>Mes Anterior:</span>
                      <span className="font-medium">
                        {metrics.monthly_data[1] && metrics.monthly_data[1].total_income > 0
                          ? `${((metrics.monthly_data[1].net_income / metrics.monthly_data[1].total_income) * 100).toFixed(1)}%`
                          : "0%"}
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Variación:</span>
                      <span className={`font-medium ${
                        metrics.monthly_data[0]?.net_income > metrics.monthly_data[1]?.net_income 
                          ? "text-green-500" 
                          : "text-red-500"
                      }`}>
                        {metrics.monthly_data[1] && metrics.monthly_data[1].total_income > 0
                          ? `${(((metrics.monthly_data[0]?.net_income / metrics.monthly_data[0]?.total_income) - 
                              (metrics.monthly_data[1]?.net_income / metrics.monthly_data[1]?.total_income)) * 100).toFixed(1)}%`
                          : "0%"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>ROI Marketing</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Calculate ROI based on marketing expenses if available */}
                  {(() => {
                    const marketingExpense = metrics.expense_by_category.find(
                      cat => cat.category.toLowerCase().includes('marketing')
                    );
                    const roi = marketingExpense && marketingExpense.total > 0
                      ? metrics.total_income / marketingExpense.total
                      : 0;
                    
                    return (
                      <>
                        <div className="flex items-center">
                          <span className="text-3xl font-bold">{roi.toFixed(1)}x</span>
                          <ChevronUp className="h-6 w-6 text-green-500 ml-2" />
                        </div>
                        <p className="text-muted-foreground mt-1">
                          Ingresos / Gasto en Marketing
                        </p>
                        <div className="mt-4 text-sm">
                          <div className="flex justify-between">
                            <span>Mes Anterior:</span>
                            <span className="font-medium">-</span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span>Variación:</span>
                            <span className="font-medium text-green-500">-</span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Efectivo Disponible</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {formatCurrency(metrics.accumulated_balance)}
                  </div>
                  <p className="text-muted-foreground mt-1">
                    Saldo acumulado
                  </p>
                  <div className="mt-4 text-sm">
                    <div className="flex justify-between">
                      <span>Meses de operación cubiertos:</span>
                      <span className="font-medium">
                        {metrics.total_expense > 0 
                          ? (metrics.accumulated_balance / metrics.total_expense).toFixed(1) 
                          : "∞"} meses
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Burn rate mensual:</span>
                      <span className="font-medium">{formatCurrency(metrics.total_expense)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Análisis de Tendencias</CardTitle>
                <CardDescription>
                  Evolución de indicadores clave en el tiempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics.monthly_data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" tickFormatter={(value) => `$${value / 1000000}M`} />
                      <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value / 1000000}M`} />
                      <Tooltip formatter={(value, name) => {
                        if (name === "net_income") {
                          return [formatCurrency(Number(value)), "Utilidad"];
                        } else if (name === "margen") {
                          return [`${(Number(value) * 100).toFixed(1)}%`, "Margen"];
                        }
                        return [formatCurrency(Number(value)), name];
                      }} />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="total_income"
                        name="Ingresos"
                        stroke="#4ade80"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="total_expense"
                        name="Gastos"
                        stroke="#f87171"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="net_income"
                        name="Utilidad"
                        stroke="#4b4ce6"
                        strokeWidth={3}
                        dot={{ r: 5 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey={(item) => item.total_income > 0 ? item.net_income / item.total_income : 0}
                        name="margen"
                        stroke="#facc15"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Proyección Financiera</CardTitle>
                  <CardDescription>
                    Estimación a 6 meses basada en tendencias actuales
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Ingresos Proyectados</h4>
                        <p className="text-muted-foreground text-sm">Próximos 6 meses</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{formatCurrency(metrics.total_income * 6)}</p>
                        <p className="text-sm text-green-500">+9.4% vs periodo anterior</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Gastos Proyectados</h4>
                        <p className="text-muted-foreground text-sm">Próximos 6 meses</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{formatCurrency(metrics.total_expense * 6)}</p>
                        <p className="text-sm text-red-500">+7.2% vs periodo anterior</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div>
                        <h4 className="font-medium">Utilidad Proyectada</h4>
                        <p className="text-muted-foreground text-sm">Próximos 6 meses</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{formatCurrency(metrics.net_income * 6)}</p>
                        <p className="text-sm text-green-500">vs. pérdida periodo anterior</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recomendaciones</CardTitle>
                  <CardDescription>
                    Acciones sugeridas basadas en indicadores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-amber-50 rounded-md border border-amber-200">
                      <h4 className="font-medium text-amber-800 mb-1">Control de Gastos</h4>
                      <p className="text-sm text-amber-700">
                        Los gastos están creciendo a un ritmo mayor que los ingresos. 
                        Considerar ajustar presupuestos en categorías no esenciales.
                      </p>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-1">Diversificación de Clientes</h4>
                      <p className="text-sm text-blue-700">
                        El {metrics.income_by_client[0] ? 
                          ((metrics.income_by_client[0].total / metrics.total_income) * 100).toFixed(0) : 0}% 
                        de los ingresos proviene de un solo cliente. Buscar
                        oportunidades para reducir la dependencia.
                      </p>
                    </div>
                    
                    <div className="p-3 bg-green-50 rounded-md border border-green-200">
                      <h4 className="font-medium text-green-800 mb-1">Inversión en Marketing</h4>
                      <p className="text-sm text-green-700">
                        El ROI de marketing es positivo. Considerar aumentar la inversión
                        en campañas efectivas.
                      </p>
                    </div>
                    
                    <div className="p-3 bg-purple-50 rounded-md border border-purple-200">
                      <h4 className="font-medium text-purple-800 mb-1">Gestión de Liquidez</h4>
                      <p className="text-sm text-purple-700">
                        Las reservas actuales cubren {metrics.total_expense > 0 
                          ? (metrics.accumulated_balance / metrics.total_expense).toFixed(1) 
                          : "∞"} meses de operación. Considerar
                        estrategias para aumentar el flujo de caja.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
