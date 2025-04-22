
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie,
  Scatter,
  ScatterChart,
  ZAxis
} from "recharts";
import { 
  ArrowUp, 
  ArrowDown, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  AlertTriangle 
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface ClientProfitability {
  name: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
}

interface ClientGrowth {
  name: string;
  previousValue: number;
  currentValue: number;
  growth?: number;
  decline?: number;
}

interface MrrChanges {
  newMrr: number;
  churn: number;
  netMrr: number;
}

interface ClientConcentrationData {
  name: string;
  value: number;
  percentage: number;
}

interface ClientAnalyticsProps {
  clientProfitability: ClientProfitability[];
  growingClients: ClientGrowth[];
  decliningClients: ClientGrowth[];
  mrrChanges: MrrChanges;
  timeFrame?: string;
  onTimeFrameChange?: (value: string) => void;
}

export function ClientAnalytics({ 
  clientProfitability, 
  growingClients, 
  decliningClients, 
  mrrChanges,
  timeFrame = "month",
  onTimeFrameChange
}: ClientAnalyticsProps) {
  const [analysisTab, setAnalysisTab] = useState("profitability");
  const [clientFilter, setClientFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Calcular concentración de clientes
  const totalRevenue = clientProfitability.reduce((sum, client) => sum + client.revenue, 0);
  const clientConcentration: ClientConcentrationData[] = clientProfitability
    .sort((a, b) => b.revenue - a.revenue)
    .map((client) => ({
      name: client.name,
      value: client.revenue,
      percentage: (client.revenue / totalRevenue) * 100
    }));
  
  // Calcular margen promedio
  const averageMargin = clientProfitability.reduce((sum, client) => sum + client.margin, 0) / clientProfitability.length;
  
  // Prepare data for MRR changes chart
  const mrrChangesData = [
    { name: "Nuevo MRR", value: mrrChanges.newMrr },
    { name: "Churn", value: -mrrChanges.churn },
    { name: "Neto", value: mrrChanges.netMrr }
  ];

  // Datos para gráfico de burbujas de rentabilidad vs tamaño
  const bubbleChartData = clientProfitability.map((client) => ({
    name: client.name,
    revenue: client.revenue,
    margin: client.margin,
    profit: client.profit,
    z: client.cost // Tamaño de la burbuja basado en el costo
  }));
  
  // Determinar si hay riesgo de concentración (más de 30% del ingreso en un solo cliente)
  const concentrationRisk = clientConcentration.length > 0 && clientConcentration[0].percentage > 30;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-2">
        <Tabs defaultValue="profitability" className="w-full" onValueChange={setAnalysisTab}>
          <TabsList>
            <TabsTrigger value="profitability">Rentabilidad por Cliente</TabsTrigger>
            <TabsTrigger value="growth">Crecimiento de Clientes</TabsTrigger>
            <TabsTrigger value="concentration">Concentración</TabsTrigger>
            <TabsTrigger value="mrr">Cambios en MRR</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {onTimeFrameChange && (
          <div className="w-[180px]">
            <Select value={timeFrame} onValueChange={onTimeFrameChange}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Este Mes</SelectItem>
                <SelectItem value="quarter">Este Trimestre</SelectItem>
                <SelectItem value="ytd">Año a la Fecha (YTD)</SelectItem>
                <SelectItem value="year">Este Año</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* KPIs generales sobre clientes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={concentrationRisk ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"}>
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle className="text-sm">Concentración de Ingresos</CardTitle>
              {concentrationRisk ? (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              ) : (
                <TrendingUp className="h-5 w-5 text-green-500" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientConcentration.length > 0 ? `${clientConcentration[0].percentage.toFixed(1)}%` : "0%"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {clientConcentration.length > 0 ? `En cliente principal: ${clientConcentration[0].name}` : "No hay datos de clientes"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle className="text-sm">Margen de Utilidad Promedio</CardTitle>
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageMargin.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {averageMargin > 50 ? "Margen saludable" : "Oportunidad de mejora"}
            </p>
          </CardContent>
        </Card>

        <Card className={mrrChanges.netMrr >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle className="text-sm">MRR Neto</CardTitle>
              {mrrChanges.netMrr >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mrrChanges.netMrr)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Nuevos: {formatCurrency(mrrChanges.newMrr)} | Churn: {formatCurrency(mrrChanges.churn)}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <TabsContent value="profitability">
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Clientes por Rentabilidad</CardTitle>
              <CardDescription>Ingresos, costos y margen por cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={clientProfitability.sort((a, b) => b.profit - a.profit)}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => `$${value / 1000000}M`} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip
                      formatter={(value, name) => {
                        const formattedValue = formatCurrency(Number(value));
                        if (name === "margin") return [`${value}%`, "Margen"];
                        if (name === "profit") return [formattedValue, "Utilidad"];
                        if (name === "revenue") return [formattedValue, "Ingresos"];
                        if (name === "cost") return [formattedValue, "Costos"];
                        return [formattedValue, name];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" name="Ingresos" fill="#4ade80" stackId="a" />
                    <Bar dataKey="cost" name="Costos" fill="#f87171" stackId="a" />
                    <Line
                      type="monotone"
                      dataKey="margin"
                      name="Margen %"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Relación Ingresos vs Margen</CardTitle>
              <CardDescription>Tamaño = volumen de costos asociados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="revenue"
                      name="Ingresos"
                      tickFormatter={(value) => `$${value / 1000000}M`}
                    />
                    <YAxis 
                      dataKey="margin" 
                      name="Margen %" 
                      unit="%" 
                      domain={[0, 'dataMax + 10']}
                    />
                    <ZAxis dataKey="z" range={[50, 500]} name="Costos" />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === "Ingresos") return [formatCurrency(Number(value)), name];
                        if (name === "Margen %") return [`${Number(value).toFixed(1)}%`, name];
                        if (name === "Costos") return [formatCurrency(Number(value)), name];
                        return [value, name];
                      }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border rounded-md shadow-md">
                              <p className="font-medium">{data.name}</p>
                              <p>Ingresos: {formatCurrency(data.revenue)}</p>
                              <p>Margen: {data.margin.toFixed(1)}%</p>
                              <p>Costos: {formatCurrency(data.z)}</p>
                              <p>Utilidad: {formatCurrency(data.profit)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter
                      name="Clientes"
                      data={bubbleChartData}
                      fill="#8884d8"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="growth">
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Clientes en Crecimiento</CardTitle>
              <CardDescription>Variación positiva en el período seleccionado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {growingClients.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">
                    No hay clientes con crecimiento en el período seleccionado
                  </div>
                ) : (
                  growingClients.map((client, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-green-50 border border-green-100 rounded-lg">
                      <div>
                        <h4 className="font-medium">{client.name}</h4>
                        <div className="flex items-center gap-1 text-green-600 text-sm">
                          <ArrowUp className="h-4 w-4" />
                          <span>+{client.growth?.toFixed(1)}% crecimiento</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(client.currentValue)}</div>
                        <div className="text-sm text-muted-foreground">
                          antes: {formatCurrency(client.previousValue)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Clientes en Declive</CardTitle>
              <CardDescription>Variación negativa en el período seleccionado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {decliningClients.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">
                    No hay clientes con declive en el período seleccionado
                  </div>
                ) : (
                  decliningClients.map((client, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-red-50 border border-red-100 rounded-lg">
                      <div>
                        <h4 className="font-medium">{client.name}</h4>
                        <div className="flex items-center gap-1 text-red-600 text-sm">
                          <ArrowDown className="h-4 w-4" />
                          <span>{client.decline?.toFixed(1)}% declive</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(client.currentValue)}</div>
                        <div className="text-sm text-muted-foreground">
                          antes: {formatCurrency(client.previousValue)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Análisis de Tendencias</CardTitle>
              <CardDescription>Evolución de los principales clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${value / 1000000}M`} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  {/* Aquí se pueden agregar líneas dinámicamente según datos históricos */}
                  <Line type="monotone" dataKey="cliente1" stroke="#8884d8" name="Cliente A" />
                  <Line type="monotone" dataKey="cliente2" stroke="#82ca9d" name="Cliente B" />
                  <Line type="monotone" dataKey="cliente3" stroke="#ffc658" name="Cliente C" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="concentration">
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Ingresos por Cliente</CardTitle>
              <CardDescription>Porcentaje sobre el total de ingresos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={clientConcentration}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {clientConcentration.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#FF8042' : ['#0088FE', '#00C49F', '#FFBB28', '#8884d8'][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Análisis de Concentración</CardTitle>
              <CardDescription>Distribución de ingresos y riesgo asociado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {concentrationRisk && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800">Riesgo de concentración detectado</h4>
                      <p className="text-sm text-amber-700 mt-1">
                        El {clientConcentration[0]?.percentage.toFixed(1)}% de tus ingresos dependen de un solo cliente ({clientConcentration[0]?.name}).
                        Considera diversificar tu cartera de clientes para reducir el riesgo.
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-medium mb-3">Distribución detallada</h3>
                  <div className="space-y-2">
                    {clientConcentration.map((client, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-32 truncate">{client.name}</div>
                        <div className="flex-1 mx-2">
                          <div className="h-2 bg-gray-200 rounded-full">
                            <div
                              className={`h-2 rounded-full ${index === 0 ? 'bg-amber-500' : 'bg-blue-500'}`}
                              style={{ width: `${client.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="w-20 text-right text-sm">{client.percentage.toFixed(1)}%</div>
                        <div className="w-24 text-right">{formatCurrency(client.value)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Consejos de diversificación</h3>
                  <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                    <li>Busca ampliar servicios en clientes pequeños con potencial</li>
                    <li>Considera desarrollar nuevos productos para mercados distintos</li>
                    <li>Establece límites máximos de concentración (ej: 25% por cliente)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="mrr">
        <Card>
          <CardHeader>
            <CardTitle>Cambios en MRR (Monthly Recurring Revenue)</CardTitle>
            <CardDescription>Análisis de nuevo MRR, churn y balance neto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="text-green-600 h-5 w-5" />
                  <span className="text-sm font-medium">Nuevo MRR</span>
                </div>
                <div className="text-xl font-bold mt-2">{formatCurrency(mrrChanges.newMrr)}</div>
              </div>
              
              <div className="bg-red-50 border border-red-100 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingDown className="text-red-600 h-5 w-5" />
                  <span className="text-sm font-medium">Churn</span>
                </div>
                <div className="text-xl font-bold mt-2">{formatCurrency(mrrChanges.churn)}</div>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className={`h-5 w-5 rounded-full flex items-center justify-center ${mrrChanges.netMrr >= 0 ? 'bg-green-600' : 'bg-red-600'} text-white font-bold text-xs`}>
                    {mrrChanges.netMrr >= 0 ? '+' : '-'}
                  </span>
                  <span className="text-sm font-medium">MRR Neto</span>
                </div>
                <div className="text-xl font-bold mt-2">{formatCurrency(mrrChanges.netMrr)}</div>
              </div>
            </div>
            
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mrrChangesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${Math.abs(value) / 1000000}M`} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar 
                    dataKey="value" 
                    name="Valor"
                    fill="#4ade80" 
                    radius={[4, 4, 0, 0]}
                  >
                    {mrrChangesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.value >= 0 ? "#4ade80" : "#f87171"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Análisis del MRR</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  {mrrChanges.netMrr > 0 
                    ? `Tu MRR está creciendo a un ritmo saludable. El crecimiento neto de ${formatCurrency(mrrChanges.netMrr)} indica una buena adquisición y retención de clientes.` 
                    : `Tu MRR está en declive. La pérdida neta de ${formatCurrency(Math.abs(mrrChanges.netMrr))} indica problemas de retención o adquisición de clientes.`}
                </p>
                <p>
                  <span className="font-medium">Tasa de churn:</span> {((mrrChanges.churn / (mrrChanges.churn + mrrChanges.newMrr)) * 100).toFixed(1)}% 
                  {mrrChanges.churn > mrrChanges.newMrr * 0.5 ? " (Alta, considerar estrategias de retención)" : " (Dentro de parámetros normales)"}
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="outline">
                Generar reporte detallado
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </div>
  );
}
