import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IncomeList } from "./income-list";
import { IncomeAnalysis } from "./income-analysis";
import { ListFilter, BarChart } from "lucide-react";

export function IncomeTabs() {
  return (
    <Tabs defaultValue="list" className="space-y-6">
      <TabsList className="grid grid-cols-2 w-full max-w-[400px] bg-[#1e1756]/20 border border-purple-800/20">
        <TabsTrigger 
          value="list" 
          className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-200 flex items-center gap-2"
        >
          <ListFilter className="h-4 w-4" />
          Ingresos
        </TabsTrigger>
        <TabsTrigger 
          value="analysis"
          className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-200 flex items-center gap-2"
        >
          <BarChart className="h-4 w-4" />
          Análisis
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="list">
        <IncomeList />
      </TabsContent>
      
      <TabsContent value="analysis">
        <IncomeAnalysis />
      </TabsContent>
    </Tabs>
  );
}