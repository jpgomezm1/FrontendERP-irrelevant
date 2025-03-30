
import React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { CircleDollarSign, CreditCard, TrendingUp, Users, ArrowDownUp } from "lucide-react";

// Datos simulados para el dashboard
const monthlyData = [
  { month: "Ene", ingresos: 24500000, gastos: 18700000 },
  { month: "Feb", ingresos: 26700000, gastos: 19200000 },
  { month: "Mar", ingresos: 23900000, gastos: 17800000 },
  { month: "Abr", ingresos: 28400000, gastos: 20100000 },
  { month: "May", ingresos: 27800000, gastos: 21300000 },
  { month: "Jun", ingresos: 29600000, gastos: 22400000 },
];

const clientData = [
  { name: "Cliente A", value: 12400000 },
  { name: "Cliente B", value: 8700000 },
  { name: "Cliente C", value: 5300000 },
  { name: "Cliente D", value: 3200000 },
];

const expenseCategories = [
  { name: "Personal", value: 9800000 },
  { name: "Tecnología", value: 5200000 },
  { name: "Marketing", value: 3700000 },
  { name: "Freelancers", value: 2300000 },
  { name: "Otros", value: 1400000 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard = () => {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Vista general del estado financiero"
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Ingresos este mes"
          value={formatCurrency(29600000)}
          trend="up"
          trendValue="6.4%"
          icon={<CircleDollarSign className="h-4 w-4" />}
        />
        <StatsCard
          title="Gastos este mes"
          value={formatCurrency(22400000)}
          trend="up"
          trendValue="4.9%"
          icon={<CreditCard className="h-4 w-4" />}
        />
        <StatsCard
          title="Saldo en caja"
          value={formatCurrency(7200000)}
          trend="up"
          trendValue="10.7%"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatsCard
          title="Clientes activos"
          value="8"
          trend="neutral"
          trendValue="0%"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      <Tabs defaultValue="ingresos-gastos" className="mt-6">
        <TabsList>
          <TabsTrigger value="ingresos-gastos">Ingresos vs Gastos</TabsTrigger>
          <TabsTrigger value="clientes">Top Clientes</TabsTrigger>
          <TabsTrigger value="categorias">Gastos por Categoría</TabsTrigger>
        </TabsList>
        <TabsContent value="ingresos-gastos">
          <Card>
            <CardHeader>
              <CardTitle>Ingresos vs Gastos (Últimos 6 Meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${value / 1000000}M`} />
                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(Number(value)),
                        "",
                      ]}
                    />
                    <Legend />
                    <Bar
                      name="Ingresos"
                      dataKey="ingresos"
                      fill="#4b4ce6"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      name="Gastos"
                      dataKey="gastos"
                      fill="#f87171"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="clientes">
          <Card>
            <CardHeader>
              <CardTitle>Top Clientes por Ingresos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={clientData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {clientData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categorias">
          <Card>
            <CardHeader>
              <CardTitle>Gastos por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {expenseCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="grid gap-4 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Flujo de Caja</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${value / 1000000}M`} />
                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(Number(value)),
                      "",
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="ingresos"
                    stroke="#4b4ce6"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="gastos"
                    stroke="#f87171"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Movimientos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: "ingreso", desc: "Pago Cliente A", amount: 4800000, date: "15 Jun 2023" },
                { type: "gasto", desc: "Nómina", amount: 7500000, date: "10 Jun 2023" },
                { type: "ingreso", desc: "Pago Cliente B", amount: 3200000, date: "8 Jun 2023" },
                { type: "gasto", desc: "Hosting", amount: 850000, date: "5 Jun 2023" },
                { type: "gasto", desc: "Freelancer Diseño", amount: 1200000, date: "3 Jun 2023" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`mr-2 p-2 rounded ${item.type === "ingreso" ? "bg-green-100" : "bg-red-100"}`}>
                      <ArrowDownUp className={`h-4 w-4 ${item.type === "ingreso" ? "text-green-500" : "text-red-500"}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.desc}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${item.type === "ingreso" ? "text-green-500" : "text-red-500"}`}>
                    {item.type === "ingreso" ? "+" : "-"}{formatCurrency(item.amount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
