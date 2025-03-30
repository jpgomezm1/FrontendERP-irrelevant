
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
  LogOut
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "../ui/button";

interface SidebarProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const SidebarLink = ({ to, icon: Icon, children }: { to: string; icon: React.ElementType; children: React.ReactNode }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:text-white",
        isActive
          ? "bg-irrelevant-600 text-white"
          : "text-gray-400 hover:bg-irrelevant-800"
      )
    }
  >
    <Icon className="h-5 w-5" />
    <span>{children}</span>
  </NavLink>
);

export function Sidebar({ open, setOpen }: SidebarProps) {
  const isMobile = useIsMobile();

  return (
    <aside
      className={cn(
        "bg-irrelevant-950 text-white z-30 h-full w-64 shrink-0 border-r border-sidebar-border overflow-y-auto transition-all duration-300",
        isMobile && "fixed",
        isMobile && !open && "-translate-x-full"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <div className="font-bold text-xl">irrelevant</div>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="text-white hover:bg-sidebar-accent"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Cerrar menú</span>
          </Button>
        )}
      </div>
      <nav className="flex flex-col gap-1 p-4">
        <SidebarLink to="/" icon={LayoutDashboard}>
          Dashboard
        </SidebarLink>
        <SidebarLink to="/gastos" icon={ReceiptText}>
          Gastos
        </SidebarLink>
        <SidebarLink to="/ingresos" icon={Wallet}>
          Ingresos
        </SidebarLink>
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
      <div className="mt-auto p-4 border-t border-sidebar-border">
        <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-irrelevant-800">
          <LogOut className="mr-2 h-5 w-5" />
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  );
}
