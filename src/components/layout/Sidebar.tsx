import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { Home, BadgePlus, FormInputIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logo from '../../assets/promotorialogotipo_positivo.png'
import LogoutButton from "../LogoutButton";

export default function AppSidebar() {

  const location = useLocation();
  const pathname = location.pathname;

  const getActiveClass = (route: string) => 
    pathname === route
      ? "bg-gray-300 text-black font-semibold"
      : "hover:bg-gray-200";

  return (
    <Sidebar className="w-56 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] h-screen flex flex-col">
      <SidebarHeader className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <img src={logo} alt="Logo" className="h-20" />
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 p-2 flex flex-col justify-between">
      <div className="space-y-2">
        <SidebarMenu>
          <SidebarMenuItem asChild>
            <Link to="/" className={`flex items-center gap-3 p-3 rounded-lg transition ${getActiveClass("/")}`}>
              <Home className="w-4 h-4" /> Inicio
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem asChild>
            <Link to="/productList" className={`flex items-center gap-3 p-3 rounded-lg transition text-sm ${getActiveClass("/productList")}`}>
              <FormInputIcon className="w-4 h-4" /> Productos
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem asChild>
            <Link to="/solicitudes" className={`flex items-center gap-3 p-3 rounded-lg transition text-sm ${getActiveClass("/solicitudes")}`}>
              <BadgePlus className="w-4 h-4" /> Solicitudes
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
        <LogoutButton/>
      </SidebarContent>

      <div className="p-4 border-t border-gray-200">
        <p className="text-sm text-gray-400">© 2025 Promotoria</p>
      </div>
    </Sidebar>
  );
}
