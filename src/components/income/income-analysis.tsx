
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, convertCurrency, Currency } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { monthlyData, incomesData } from "./income-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function IncomeAnalysis() {
  const [displayCurrency, setDisplayCurrency] = useState<Currency>("COP");

  // Convert values based on selected currency
  const totalMonth = incomesData
    .filter(income => {
      const incomeDate = new Date(income.date);
      const now = new Date();
      return incomeDate.getMonth() === now.getMonth() && 
             incomeDate.getFullYear() === now.getFullYear();
    })
    .reduce((acc, income) => {
      const amount = displayCurrency === income.currency 
        ? income.amount 
        : convertCurrency(income.amount, income.currency, displayCurrency);
      return acc + amount;
    }, 0);

  const avgMonth = monthlyData.reduce((acc, month) => acc + month.ingresos, 0) / monthlyData.length;
  const avgMonthConverted = displayCurrency === "COP" 
    ? avgMonth 
    : convertCurrency(avgMonth, "COP", "USD");

  const clientIncome = incomesData
    .filter(income => income.type === "Cliente")
    .reduce((acc, income) => {
      const amount = displayCurrency === income.currency 
        ? income.amount 
        : convertCurrency(income.amount, income.currency, displayCurrency);
      return acc + amount;
    }, 0);

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <Select value={displayCurrency} onValueChange={(value: Currency) => setDisplayCurrency(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Moneda de visualización" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="COP">Pesos Colombianos (COP)</SelectItem>
            <SelectItem value="USD">Dólares (USD)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total del Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {formatCurrency(25600000)}
            </div>
            <p className="text-xs text-blue-600/80">Junio 2023</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Promedio Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(20750000)}
            </div>
            <p className="text-xs text-green-600/80">Últimos 6 meses</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Por Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {formatCurrency(15600000)}
            </div>
            <p className="text-xs text-purple-600/80">60.9% del total</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Análisis de Ingresos Mensuales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData.map(month => ({
                  ...month,
                  ingresos: displayCurrency === "COP" 
                    ? month.ingresos 
                    : convertCurrency(month.ingresos, "COP", "USD")
                }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${value / 1000000}M`} />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value)), "Ingresos"]}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="ingresos"
                  fill="url(#colorGradient)"
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#818CF8" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
