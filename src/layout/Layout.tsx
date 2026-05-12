import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Outlet, useLocation } from "react-router-dom"


import { cn } from "@/lib";
import { Sidebar } from "./Sidebar"
import { useAuthStore } from "@/stores"
import { SidebarProvider } from '@/components'


const ROUTE_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/clientes": "Clientes",
  "/crearCliente": "Nuevo cliente",
  "/productos": "Productos",
  "/producto": "Nuevo producto",
  "/establecimientos": "Establecimientos",
  "/establecimiento": "Nuevo establecimiento",
  "/preguntas": "Preguntas",
  "/solicitudes": "Solicitudes",
  "/crearSolicitud": "Nueva solicitud",
  "/pedidos": "Pedidos",
  "/crearPedido": "Nuevo pedido",
  "/finanzas": "Finanzas",
  "/mi-negocio": "Mi Negocio",
  "/perfil": "Mi Perfil",
  "/servicios": "Servicios",
};

function getRouteLabel(pathname: string): string {
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];
  // Dynamic routes
  if (pathname.startsWith("/clientes/")) return "Detalle de cliente";
  if (pathname.startsWith("/producto/detalle/")) return "Detalle de producto";
  if (pathname.startsWith("/producto/")) return "Editar producto";
  if (pathname.startsWith("/establecimiento/detalle/")) return "Detalle de establecimiento";
  if (pathname.startsWith("/establecimiento/")) return "Editar establecimiento";
  if (pathname.startsWith("/preguntas/detalle/")) return "Detalle de pregunta";
  if (pathname.startsWith("/cotizaciones/detalle/")) return "Detalle de cotización";
  if (pathname.startsWith("/detalle-solicitud/")) return "Detalle de solicitud";
  if (pathname.startsWith("/editar-solicitud/")) return "Editar solicitud";
  if (pathname.startsWith("/detalle-pedido/")) return "Detalle de pedido";
  return "Promotoria";
}

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
      style={{ backgroundColor: "var(--color-brand)", color: "#000" }}
    >
      {initials || "U"}
    </div>
  );
}

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuthStore();

  const pageLabel = getRouteLabel(location.pathname);
  const userName = [user?.name, user?.lastname].filter(Boolean).join(" ") || "Usuario";

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <SidebarProvider>
      <div className="relative flex h-screen w-screen overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={handleCloseSidebar}
            style={{ pointerEvents: "auto" }}
          />
        )}

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Mobile header */}
          <div
            className="lg:hidden flex items-center p-4 border-b relative z-50"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
          >
            <button
              onClick={handleMenuToggle}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              type="button"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="ml-3 font-semibold text-base" style={{ color: "var(--text-primary)" }}>
              {pageLabel}
            </h1>
          </div>

          {/* Desktop top header */}
          <div
            className={cn(
              "hidden lg:flex items-center justify-between px-6 h-14 flex-shrink-0 border-b",
            )}
            style={{
              backgroundColor: "var(--card-bg)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-1.5 h-5 rounded-full"
                style={{ backgroundColor: "var(--color-brand)" }}
              />
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {pageLabel}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-medium leading-none" style={{ color: "var(--text-primary)" }}>
                  {userName}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  {user?.i_rol === 1 ? "Super Admin" : "Administrador"}
                </p>
              </div>
              <UserAvatar name={userName} />
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 overflow-auto" style={{ backgroundColor: "var(--bg)" }}>
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
