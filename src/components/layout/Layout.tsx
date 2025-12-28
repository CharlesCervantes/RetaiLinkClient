import { SidebarProvider } from "../../components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { Toaster } from "../toaster";
import Sidebar from "./Sidebar";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que el click se propague
    setSidebarOpen(!sidebarOpen); // Toggle: abre si está cerrado, cierra si está abierto
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <SidebarProvider>
      <div className="relative flex h-screen w-screen overflow-hidden">
        {/* Sidebar - ANTES del overlay */}
        <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

        {/* Overlay para móviles - DESPUÉS del sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={handleCloseSidebar}
            style={{ pointerEvents: "auto" }}
          />
        )}

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header móvil */}
          <div className="lg:hidden flex items-center p-4 border-b border-border bg-background relative z-50">
            <button
              onClick={handleMenuToggle}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              type="button"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            <h1 className="ml-4 font-semibold text-lg">Promotoria</h1>
          </div>

          {/* Contenido principal */}
          <main className="flex-1 overflow-auto p-4 bg-background pt-0">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
