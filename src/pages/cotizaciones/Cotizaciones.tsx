import { useAuthStore } from "../../store/authStore";
import CotizacionesSuperAdmin from "./CotizacionesSuperAdmin";
import CotizacionesAdmin from "./CotizacionesAdmin";

export default function Cotizaciones() {
    const { user } = useAuthStore();

    if (user?.i_rol === 1) {
        return <CotizacionesSuperAdmin />;
    }

    return <CotizacionesAdmin />;
}
