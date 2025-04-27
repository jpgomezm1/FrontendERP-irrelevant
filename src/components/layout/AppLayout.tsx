import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Outlet } from "react-router-dom";
import { MenuIcon, Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f0b2a]/95">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-purple-900/30 bg-[#0f0b2a]/95 px-4 sm:px-6 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-purple-900/20"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          
          <div className="flex-1 flex items-center">
            <h1 className="text-lg font-semibold text-white md:text-xl">
              Sistema de Control Financiero
            </h1>
          </div>
          
          {/* Search bar */}
          <div className="hidden md:flex relative rounded-full bg-purple-900/20 border border-purple-900/30 w-64 items-center px-3">
            <Search className="h-4 w-4 text-purple-400" />
            <input 
              type="text"
              placeholder="Buscar..."
              className="bg-transparent border-none text-sm text-white placeholder:text-purple-400 focus:outline-none focus:ring-0 py-1.5 px-2 w-full"
            />
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full text-white hover:bg-purple-900/20 relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full"></span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full text-white hover:bg-purple-900/20"
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Content area */}
        <main 
          className={cn(
            "flex-1 overflow-auto p-4 md:p-6 bg-gradient-to-br from-[#0f0b2a]/95 to-[#1a1542]/95",
            isMobile && sidebarOpen && "blur-sm"
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};