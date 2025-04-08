import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { Home, Radio, BadgePlus, FormInputIcon } from "lucide-react";
import { Link } from "react-router-dom";

export default function AppSidebar() {

  return (
    <Sidebar className="w-56 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] h-screen flex flex-col">
      <SidebarHeader className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold">Promotoria</h2>
      </SidebarHeader>

      <SidebarContent className="flex-1 p-2 space-y-2">
            <SidebarMenu>
              <SidebarMenuItem asChild>
                <Link to="/" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-200 transition">
                  <Home className="w-4 h-4" /> Inicio
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem asChild>
                <Link to="/crearSolicitud" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-200 transition text-sm">
                  <BadgePlus className="w-4 h-4"/>Crear Solicitud
                </Link>
              </SidebarMenuItem>
                    
              <SidebarMenuItem asChild>
                <Link to="/solicitudes" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-200 transition text-sm">
                  <Radio className="w-4 h-4"/>Solicitudes Activas
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem asChild>
                <Link to="/pructList" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-200 transition text-sm">
                  <FormInputIcon className="w-4 h-4"/>Productos
                </Link>
              </SidebarMenuItem>
          
        </SidebarMenu>
      </SidebarContent>

      <div className="p-4 border-t border-gray-200">
        <p className="text-sm text-gray-400">© 2025 Promotoria</p>
      </div>
    </Sidebar>
  );
}
