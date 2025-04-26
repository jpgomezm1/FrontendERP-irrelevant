
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { IncomeTabs } from "@/components/income/income-tabs";
import { AddIncomeDialog } from "@/components/income/add-income-dialog";
import { Plus } from "lucide-react";
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
    <div className="space-y-6">
      <Toaster position="top-right" />
      <PageHeader
        title="Ingresos"
        description="Gestiona y analiza tus fuentes de ingresos"
      >
        <AddIncomeDialog 
          open={incomeModalOpen} 
          onOpenChange={handleOpenChange}
          trigger={
            <Button>
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
