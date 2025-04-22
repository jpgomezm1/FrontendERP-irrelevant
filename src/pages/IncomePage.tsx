
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
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
import { IncomeTabs } from "@/components/income/income-tabs";
import { AddIncomeDialog } from "@/components/income/add-income-dialog";
import { Plus } from "lucide-react";

const IncomePage = () => {
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ingresos"
        description="Gestiona y analiza tus fuentes de ingresos"
      >
        <AddIncomeDialog 
          open={incomeModalOpen} 
          onOpenChange={setIncomeModalOpen}
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
