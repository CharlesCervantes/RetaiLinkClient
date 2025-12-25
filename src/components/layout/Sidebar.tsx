import {
  Sidebar as SidebarUI,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "../../components/ui/sidebar";
import logo from "../../assets/promotorialogotipo_positivo.png";
import logoSmall from "../../assets/promotorialogotipo_positivo.png";
import {
  FactoryIcon,
  Store,
  FileQuestionIcon,
  MoreVertical,
  ChevronLeft,
  HomeIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import LogoutButton from "../LogoutButton";
import { ThemeToggle } from "../ui/theme-toggle";
import { useAuthStore } from "../../store/authStore";
import { useState } from "react";
import { cn } from "../../lib/utils";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const location = useLocation();
  const pathname = location.pathname;
  const { user } = useAuthStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const getActiveClass = (route: string) =>
    pathname === route
      ? "font-semibold transition-all duration-200"
      : "transition-all duration-200";

  const getActiveStyle = (route: string) =>
    pathname === route
      ? {
          backgroundColor: "var(--accent)",
          color: "var(--color-black)",
          borderRadius: "0.5rem",
        }
      : {
          color: "var(--sidebar-fg)",
        };

  const menuItems = [
    {
      route: "/",
      icon: HomeIcon,
      label: "Inicio",
      show: true,
    },
    {
      route: "/clientes",
      icon: FactoryIcon,
      label: "Clientes",
      show: user?.i_rol === 1,
    },
    {
      route: "/establecimientos",
      icon: Store,
      label: "Tiendas",
      show: user?.i_rol === 1,
    },
    {
      route: "/preguntas",
      icon: FileQuestionIcon,
      label: "Preguntas",
      show: user?.i_rol === 1,
    },
  ];

  // Contenido del menú (compartido entre desktop y mobile)
  const MenuContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      <div className="space-y-2">
        <SidebarMenu>
          {menuItems.map(
            (item) =>
              item.show && (
                <SidebarMenuItem key={item.route} asChild>
                  <Link
                    to={item.route}
                    onClick={isMobile ? onClose : undefined}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg hover:bg-hover text-sm",
                      getActiveClass(item.route),
                      !isMobile && !isExpanded && "justify-center",
                    )}
                    style={getActiveStyle(item.route)}
                    title={!isMobile && !isExpanded ? item.label : undefined}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {(isMobile || isExpanded) && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                </SidebarMenuItem>
              ),
          )}
        </SidebarMenu>
      </div>

      <div className="space-y-3 flex-shrink-0">
        <div className="border-t border-border"></div>

        <div className={cn("px-2", !isMobile && !isExpanded && "px-1")}>
          <ThemeToggle
            size="md"
            variant="sidebar"
            showLabel={isMobile || isExpanded}
            className={cn(
              "w-full font-medium transition-all duration-200",
              isMobile || isExpanded ? "justify-start" : "justify-center",
            )}
          />
        </div>

        <LogoutButton isExpanded={isMobile || isExpanded} />
      </div>
    </>
  );

  return (
    <>
      {/* Sidebar Desktop - DIV NORMAL (parte del flex) */}
      <div
        className={cn(
          "hidden lg:flex flex-col transition-all duration-300 ease-in-out h-full flex-shrink-0",
          isExpanded ? "w-56" : "w-20",
        )}
        style={{
          backgroundColor: "var(--sidebar-bg)",
          color: "var(--sidebar-fg)",
          borderRight: "1px solid var(--border)",
        }}
      >
        {/* Header */}
        <div
          className="p-4 relative flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <div
              className={cn(
                "flex items-center justify-center transition-all duration-300 overflow-hidden",
                isExpanded ? "w-full" : "w-full",
              )}
            >
              <img
                src={isExpanded ? logo : logoSmall}
                alt="Logo"
                className={cn(
                  "transition-all duration-300 object-contain",
                  isExpanded ? "h-16" : "h-10",
                )}
              />
            </div>

            {/* Botón de toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "absolute -right-3 top-1/2 -translate-y-1/2",
                "bg-accent border border-border rounded-full p-1",
                "hover:bg-accent/80 transition-colors z-10",
              )}
            >
              {isExpanded ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <MoreVertical className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-2 flex flex-col justify-between overflow-y-auto">
          <MenuContent isMobile={false} />
        </div>

        {/* Footer */}
        {isExpanded && (
          <div className="p-4 border-t border-border flex-shrink-0">
            <p className="text-xs text-secondary">© 2025 Promotoria</p>
          </div>
        )}
      </div>

      <div
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
        style={{
          backgroundColor: "var(--sidebar-bg)",
          color: "var(--sidebar-fg)",
          borderRight: "1px solid var(--border)",
        }}
      >
        <div
          className="p-4 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <img src={logo} alt="Logo" className="h-16" />
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              type="button"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-2 overflow-y-auto">
          <MenuContent isMobile={true} />
        </div>

        <div className="p-4 border-t border-border flex-shrink-0">
          <p className="text-sm text-secondary">© 2025 Promotoria</p>
        </div>
      </div>
    </>
  );
}
