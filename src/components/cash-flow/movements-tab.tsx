
import React, { useState } from "react";
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
import { Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cashFlowColumns } from "./table-columns";
import { CashFlowItem } from "@/services/financeService";

interface MovementsTabProps {
  data: CashFlowItem[];
}

export function MovementsTab({ data }: MovementsTabProps) {
  const [dateFilter, setDateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredData = data.filter((item) => {
    return (
      (typeFilter === "all" || item.type === typeFilter) &&
      (categoryFilter === "all" || item.category === categoryFilter) &&
      (dateFilter === "all" ||
        (dateFilter === "thisWeek" &&
          item.date >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
        (dateFilter === "thisMonth" &&
          item.date.getMonth() === new Date().getMonth() &&
          item.date.getFullYear() === new Date().getFullYear()))
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Movimientos de Caja</CardTitle>
        <CardDescription>
          Registro detallado de ingresos y gastos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Select
              value={dateFilter}
              onValueChange={setDateFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por fecha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las fechas</SelectItem>
                <SelectItem value="thisWeek">Esta semana</SelectItem>
                <SelectItem value="thisMonth">Este mes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Select
              value={typeFilter}
              onValueChange={setTypeFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
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
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                <SelectItem value="Personal">Personal</SelectItem>
                <SelectItem value="Tecnología">Tecnología</SelectItem>
                <SelectItem value="Arriendo">Arriendo</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Cliente">Cliente</SelectItem>
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
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar Excel
        </Button>
      </CardFooter>
    </Card>
  );
}
