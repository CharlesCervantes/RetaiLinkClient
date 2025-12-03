import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem } from "../../components/ui/sidebar";
import logo from '../../assets/promotorialogotipo_positivo.png';
import { FactoryIcon, Store, FileQuestionIcon} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import LogoutButton from "../LogoutButton";
import { ThemeToggle } from "../ui/theme-toggle";
import { useAuthStore } from "../../store/authStore";

export default function AppSidebar() {

  const location = useLocation();
  const pathname = location.pathname;
  const { user } = useAuthStore();


  const getActiveClass = (route: string) => 
    pathname === route
      ? "font-semibold transition-all duration-200"
      : "transition-all duration-200";

  const getActiveStyle = (route: string) => 
    pathname === route
      ? {
          backgroundColor: 'var(--accent)',
          color: 'var(--color-black)',
          borderRadius: '0.5rem'
        }
      : {
          color: 'var(--sidebar-fg)'
        };

  return (
    <Sidebar 
      className="w-56 h-screen flex flex-col transition-all duration-300 ease-in-out"
      style={{
        backgroundColor: 'var(--sidebar-bg)',
        color: 'var(--sidebar-fg)',
        borderRight: '1px solid var(--border)'
      }}
    >
      <SidebarHeader className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-center">
          <img src={logo} alt="Logo" className="h-20" />
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 p-2 flex flex-col justify-between">
        <div className="space-y-2">
          <SidebarMenu>

            {/* Clientes (Negocios) SUPERADMIN */}
            {user?.i_rol === 1 && (
            <SidebarMenuItem asChild>
              <Link to="/negocios" className={`flex items-center gap-3 p-3 rounded-lg hover:bg-hover text-sm ${getActiveClass("/negocios")}`} style={getActiveStyle("/negocios")}>
                <FactoryIcon className="w-4 h-4" /> Clientes
              </Link>
            </SidebarMenuItem>
            )}

            {/* Tiendas (Establecimientos) SUPERADMIN */}
            {user?.i_rol === 1 && (
            <SidebarMenuItem asChild>
              <Link to="/establecimientos" className={`flex items-center gap-3 p-3 rounded-lg hover:bg-hover text-sm ${getActiveClass("/establecimientos")}`} style={getActiveStyle("/establecimientos")}>
                <Store className="w-4 h-4" /> Tiendas
              </Link>
            </SidebarMenuItem>
            )}

            {/* Preguntas (Preguntas) SUPERADMIN */}
            {user?.i_rol === 1 && (
            <SidebarMenuItem asChild>
              <Link to="/preguntas" className={`flex items-center gap-3 p-3 rounded-lg hover:bg-hover text-sm ${getActiveClass("/preguntas")}`}style={getActiveStyle("/preguntas")}>
                <FileQuestionIcon className="w-4 h-4" /> Preguntas
              </Link>
            </SidebarMenuItem>
            )}

            
            {/* <SidebarMenuItem asChild>
              <Link 
                to="/" 
                className={`flex items-center gap-3 p-3 rounded-lg hover:bg-hover ${getActiveClass("/")}`}
                style={getActiveStyle("/")}
              >
                <Home className="w-4 h-4" /> Inicio
              </Link>
            </SidebarMenuItem> */}
            {/* <SidebarMenuItem asChild>
              <Link 
                to="/productList" 
                className={`flex items-center gap-3 p-3 rounded-lg hover:bg-hover text-sm ${getActiveClass("/productList")}`}
                style={getActiveStyle("/productList")}
              >
                <FormInputIcon className="w-4 h-4" /> Productos
              </Link>
            </SidebarMenuItem> */}
            {/* <SidebarMenuItem asChild>
              <Link 
                to="/solicitudes" 
                className={`flex items-center gap-3 p-3 rounded-lg hover:bg-hover text-sm ${getActiveClass("/solicitudes")}`}
                style={getActiveStyle("/solicitudes")}
              >
                <BadgePlus className="w-4 h-4" /> Solicitudes
              </Link>
            </SidebarMenuItem> */}
            {user?.i_rol === 1 && (
              <>
                
                
                
              </>
            )}
          </SidebarMenu>
        </div>
        <div className="space-y-3">
          {/* Separador visual */}
          <div className="border-t border-border"></div>
          
          {/* Botón de cambio de tema */}
          <div className="px-2">
            <ThemeToggle 
              size="md" 
              variant="sidebar" 
              showLabel={true}
              className="w-full justify-start font-medium transition-all duration-200 hover:transform hover:scale-[1.02]"
            />
          </div>
          
          {/* Botón de logout */}
          <LogoutButton/>
        </div>
      </SidebarContent>

      <div className="p-4 border-t border-border">
        <p className="text-sm text-secondary">© 2025 Promotoria</p>
      </div>
    </Sidebar>
  );
}
