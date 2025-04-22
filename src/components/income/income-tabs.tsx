
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IncomeList } from "./income-list";
import { IncomeAnalysis } from "./income-analysis";

export function IncomeTabs() {
  return (
    <Tabs defaultValue="list" className="space-y-6">
      <TabsList className="grid grid-cols-2 w-full max-w-[400px]">
        <TabsTrigger value="list">Ingresos</TabsTrigger>
        <TabsTrigger value="analysis">Análisis</TabsTrigger>
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
