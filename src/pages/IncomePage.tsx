import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { IncomeTabs } from "@/components/income/income-tabs";
import { AddIncomeDialog } from "@/components/income/add-income-dialog";
import { Plus, DollarSign, TrendingUp } from "lucide-react";
import { useIncomeList } from "@/hooks/use-income-list";
import { Toaster } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const IncomePage = () => {
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const { refreshIncomes } = useIncomeList();
  const queryClient = useQueryClient();

  const handleOpenChange = (isOpen: boolean) => {
    // When dialog is closed, refresh incomes list and analytics
    if (!isOpen) {
      refreshIncomes();
      // Also invalidate the analytics queries to refresh that data
      queryClient.invalidateQueries({ queryKey: ['income-analytics'] });
    }
    setIncomeModalOpen(isOpen);
  };
  
  return (
    <div className="space-y-6 bg-[#0d0a25]/60 min-h-screen p-6">
      <Toaster position="top-right" />
      <PageHeader
        title="Ingresos"
        description="Gestiona y analiza tus fuentes de ingresos"
        icon={<DollarSign className="h-6 w-6 text-purple-400" />}
        className="text-white"
      >
        <AddIncomeDialog 
          open={incomeModalOpen} 
          onOpenChange={handleOpenChange}
          trigger={
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Ingreso
            </Button>
          }
        />
      </PageHeader>

      <IncomeTabs />
    </div>
  );
};

export default IncomePage;