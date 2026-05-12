import { FileText, Users, Package } from "lucide-react"

export const tabs = [
  { id: "info", label: "Información", icon: FileText },
  { id: "users", label: "Usuarios", icon: Users },
  { id: "products", label: "Productos", icon: Package },
];

export const ROL_LABELS: Record<number, string> = {
  1: "SuperAdmin",
  2: "Admin",
  3: "Vendedor",
};