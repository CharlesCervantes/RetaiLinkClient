import { SidebarProvider } from "@/components/ui/sidebar"
import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"

export default function Layout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        {/* Sidebar con ancho fijo */}
        <div className="w-56 flex-shrink-0 h-full">
          <Sidebar />
        </div>

        {/* Contenido principal ocupa todo el resto */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto p-4">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
