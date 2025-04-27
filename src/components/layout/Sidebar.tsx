import React, { Dispatch, SetStateAction } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ReceiptText,
  Wallet,
  Users,
  TrendingUp,
  BarChart4,
  X,
  ChevronRight
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "../ui/button";
import { LogoutDialog } from "../auth/LogoutDialog";

interface SidebarProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const SidebarLink = ({ to, icon: Icon, children }: { to: string; icon: React.ElementType; children: React.ReactNode }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative overflow-hidden group",
        isActive
          ? "bg-gradient-to-r from-purple-800/80 to-purple-700/50 text-white"
          : "text-gray-300 hover:bg-purple-900/40 hover:text-white"
      )
    }
  >
    {({ isActive }) => (
      <>
        <Icon className={cn("h-5 w-5", isActive ? "text-purple-300" : "text-gray-400 group-hover:text-purple-300")} />
        <span>{children}</span>
        {isActive && (
          <ChevronRight className="h-4 w-4 ml-auto text-purple-300" />
        )}
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-400"></div>
        )}
      </>
    )}
  </NavLink>
);

export function Sidebar({ open, setOpen }: SidebarProps) {
  const isMobile = useIsMobile();

  return (
    <aside
      className={cn(
        "bg-gradient-to-b from-[#0f0b2a] to-[#1a1542] text-white z-30 h-full w-72 shrink-0 border-r border-purple-900/30 overflow-y-auto transition-all duration-300 shadow-lg",
        isMobile && "fixed",
        isMobile && !open && "-translate-x-full"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-purple-900/30 px-6">
        <div className="flex items-center">
          <img 
            src="https://storage.googleapis.com/cluvi/nuevo_irre-removebg-preview.png"
            alt="Irrelevant Logo"
            className="h-8 w-auto"
          />
        </div>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="text-white hover:bg-purple-900/30 rounded-full"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Cerrar menú</span>
          </Button>
        )}
      </div>
      
      <div className="p-4">
        <div className="bg-purple-900/20 rounded-lg p-3 mb-6">
          <div className="text-xs font-medium text-purple-300 mb-1">Sistema Financiero</div>
          <div className="text-sm text-white">Control Interno</div>
        </div>
      </div>
      
      <nav className="flex flex-col gap-1.5 px-4">
        <div className="text-xs font-medium text-purple-400 uppercase tracking-wider px-3 mb-2">Principal</div>
        <SidebarLink to="/" icon={LayoutDashboard}>
          Dashboard
        </SidebarLink>
        <SidebarLink to="/gastos" icon={ReceiptText}>
          Gastos
        </SidebarLink>
        <SidebarLink to="/ingresos" icon={Wallet}>
          Ingresos
        </SidebarLink>
        
        <div className="text-xs font-medium text-purple-400 uppercase tracking-wider px-3 mb-2 mt-6">Gestión</div>
        <SidebarLink to="/clientes" icon={Users}>
          Clientes y Proyectos
        </SidebarLink>
        <SidebarLink to="/caja" icon={TrendingUp}>
          Caja
        </SidebarLink>
        <SidebarLink to="/reportes" icon={BarChart4}>
          Reportes Financieros
        </SidebarLink>
      </nav>
      
      <div className="mt-auto p-4 border-t border-purple-900/30">
        <div className="bg-purple-900/20 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              JP
            </div>
            <div>
              <div className="text-sm font-medium text-white">Juan Pablo</div>
              <div className="text-xs text-purple-300">Administrador</div>
            </div>
          </div>
        </div>
        <LogoutDialog />
      </div>
    </aside>
  );
}