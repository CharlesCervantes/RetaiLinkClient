import { useAuthStore } from "@/stores";
import FinanzasSuperAdmin from "./FinanzasSuperAdmin";
import { FinanzasAdmin } from "./FinanzasAdmin";

export function Finanzas() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.i_rol === 1;
  return isSuperAdmin ? <FinanzasSuperAdmin /> : <FinanzasAdmin />;
}
