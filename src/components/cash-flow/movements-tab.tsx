import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Download, Calendar, Filter, ArrowUpDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cashFlowColumns } from "./table-columns";
import { CashFlowItem } from "@/services/financeService";
import { formatCurrency } from "@/lib/utils";

interface MovementsTabProps {
  data: CashFlowItem[];
}

export function MovementsTab({ data }: MovementsTabProps) {
  const [dateFilter, setDateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Calculamos el saldo en caja como la suma de todos los ingresos menos la suma de todos los gastos
  const currentBalance = useMemo(() => {
    const totalIncome = data
      .filter(item => item.type === "Ingreso")
      .reduce((sum, item) => sum + item.amount, 0);
    
    const totalExpense = data
      .filter(item => item.type === "Gasto")
      .reduce((sum, item) => sum + item.amount, 0);
    
    return totalIncome - totalExpense;
  }, [data]);

  const categories = Array.from(new Set(data.map(item => item.category))).sort();

  const filteredData = data.filter((item) => {
    return (
      (typeFilter === "all" || item.type === typeFilter) &&
      (categoryFilter === "all" || item.category === categoryFilter) &&
      (dateFilter === "all" ||
        (dateFilter === "today" && item.date >= today) ||
        (dateFilter === "thisMonth" && item.date >= firstDayOfMonth) ||
        (dateFilter === "lastMonth" && 
          item.date >= new Date(now.getFullYear(), now.getMonth() - 1, 1) && 
          item.date < new Date(now.getFullYear(), now.getMonth(), 1)))
    );
  });

  const handleExportData = () => {
    const headers = ["Date", "Description", "Type", "Category", "Payment Method", "Amount (COP)", "Original Amount", "Original Currency", "Balance"];
    const rows = filteredData.map(item => [
      item.date.toLocaleDateString(),
      item.description,
      item.type,
      item.category,
      item.paymentMethod,
      item.amount.toString(),
      item.originalAmount?.toString() || item.amount.toString(),
      item.originalCurrency || 'COP',
      item.balance?.toString() || "0"
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `cash-flow-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <Card className="bg-[#1e1756] border-purple-800/30 text-white">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <ArrowUpDown className="h-5 w-5 text-purple-400" />
          Movimientos de Caja
        </CardTitle>
        <CardDescription className="text-slate-300">
          Registro detallado de ingresos y gastos (COP)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-[#0f0b2a] p-6 rounded-lg mb-6 border border-purple-800/30">
          <div className="text-sm text-purple-300 mb-1">Saldo Actual de Caja</div>
          <div className={`text-3xl font-bold ${currentBalance >= 0 ? "text-green-400" : "text-red-400"}`}>
            {formatCurrency(currentBalance, "COP")}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Select
              value={dateFilter}
              onValueChange={setDateFilter}
            >
              <SelectTrigger className="w-full bg-[#0f0b2a] border-purple-800/30 text-white">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-purple-400" />
                  <SelectValue placeholder="Filtrar por fecha" />
                </span>
              </SelectTrigger>
              <SelectContent className="bg-[#1e1756] border-purple-800/30 text-white">
                <SelectItem value="all">Todas las fechas</SelectItem>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="thisMonth">Este mes</SelectItem>
                <SelectItem value="lastMonth">Mes pasado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Select
              value={typeFilter}
              onValueChange={setTypeFilter}
            >
              <SelectTrigger className="bg-[#0f0b2a] border-purple-800/30 text-white">
                <span className="flex items-center">
                  <ArrowUpDown className="h-4 w-4 mr-2 text-purple-400" />
                  <SelectValue placeholder="Filtrar por tipo" />
                </span>
              </SelectTrigger>
              <SelectContent className="bg-[#1e1756] border-purple-800/30 text-white">
                <SelectItem value="all">Todos los movimientos</SelectItem>
                <SelectItem value="Ingreso">Solo ingresos</SelectItem>
                <SelectItem value="Gasto">Solo gastos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="bg-[#0f0b2a] border-purple-800/30 text-white">
                <span className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-purple-400" />
                  <SelectValue placeholder="Filtrar por categoría" />
                </span>
              </SelectTrigger>
              <SelectContent className="bg-[#1e1756] border-purple-800/30 text-white">
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DataTable
          columns={cashFlowColumns}
          data={filteredData}
          searchColumn="description"
          searchPlaceholder="Buscar movimientos..."
        />
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          onClick={handleExportData}
          className="bg-transparent border-purple-800/30 text-white hover:bg-[#0f0b2a]"
        >
          <Download className="h-4 w-4 mr-2 text-purple-400" />
          Exportar a CSV
        </Button>
      </CardFooter>
    </Card>
  );
}