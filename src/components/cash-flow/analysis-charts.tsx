import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface AnalysisChartsProps {
  monthlyData: {
    name: string;
    ingresos: number;
    gastos: number;
    balance: number;
  }[];
  categoryExpenses: {
    name: string;
    value: number;
  }[];
  clientIncome: {
    name: string;
    value: number;
  }[];
}

const COLORS = ['#9333ea', '#c084fc', '#a855f7', '#d8b4fe', '#6b21a8'];

export function AnalysisCharts({ monthlyData, categoryExpenses, clientIncome }: AnalysisChartsProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-[#1e1756] border-purple-800/30 text-white">
        <CardHeader>
          <CardTitle className="text-white">Evolución Financiera</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e2b70" />
                <XAxis dataKey="name" stroke="#a5a3c8" />
                <YAxis tickFormatter={(value) => `$${value / 1000000}M`} stroke="#a5a3c8" />
                <Tooltip 
                  formatter={(value) => [formatCurrency(Number(value)), ""]} 
                  contentStyle={{
                    backgroundColor: "#0f0b2a",
                    borderColor: "#4c1d95",
                    color: "#fff"
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="ingresos"
                  name="Ingresos"
                  stroke="#4ade80"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="gastos"
                  name="Gastos"
                  stroke="#f87171"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  name="Balance"
                  stroke="#a78bfa"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-[#1e1756] border-purple-800/30 text-white">
          <CardHeader>
            <CardTitle className="text-white">Gastos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryExpenses}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {categoryExpenses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: "#0f0b2a",
                      borderColor: "#4c1d95",
                      color: "#fff"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1e1756] border-purple-800/30 text-white">
          <CardHeader>
            <CardTitle className="text-white">Ingresos por Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clientIncome} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#2e2b70" />
                  <XAxis type="number" tickFormatter={(value) => `$${value / 1000000}M`} stroke="#a5a3c8" />
                  <YAxis type="category" dataKey="name" width={100} stroke="#a5a3c8" />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: "#0f0b2a",
                      borderColor: "#4c1d95",
                      color: "#fff"
                    }}
                  />
                  <Bar dataKey="value" fill="#a78bfa" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}