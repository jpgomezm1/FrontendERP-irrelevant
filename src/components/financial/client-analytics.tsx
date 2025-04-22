
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Line
} from "recharts";
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from "lucide-react";

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

interface ClientAnalyticsProps {
  clientProfitability: ClientProfitability[];
  growingClients: ClientGrowth[];
  decliningClients: ClientGrowth[];
  mrrChanges: MrrChanges;
}

export function ClientAnalytics({ 
  clientProfitability, 
  growingClients, 
  decliningClients, 
  mrrChanges 
}: ClientAnalyticsProps) {
  const [analysisTab, setAnalysisTab] = React.useState("profitability");

  // Prepare data for MRR changes chart
  const mrrChangesData = [
    { name: "Nuevo MRR", value: mrrChanges.newMrr },
    { name: "Churn", value: -mrrChanges.churn },
    { name: "Neto", value: mrrChanges.netMrr }
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="profitability" className="w-full" onValueChange={setAnalysisTab}>
        <TabsList>
          <TabsTrigger value="profitability">Rentabilidad por Cliente</TabsTrigger>
          <TabsTrigger value="growth">Crecimiento de Clientes</TabsTrigger>
          <TabsTrigger value="mrr">Cambios en MRR</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profitability">
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Clientes por Rentabilidad</CardTitle>
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
        </TabsContent>

        <TabsContent value="growth">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Clientes en Crecimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {growingClients.map((client, index) => (
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
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Clientes en Declive</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {decliningClients.map((client, index) => (
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
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mrr">
          <Card>
            <CardHeader>
              <CardTitle>Cambios en MRR (Monthly Recurring Revenue)</CardTitle>
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
                      fill={(data) => data.value >= 0 ? '#4ade80' : '#f87171'} 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
