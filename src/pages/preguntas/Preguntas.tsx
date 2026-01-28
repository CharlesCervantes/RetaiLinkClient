import { useAuthStore } from "../../store/authStore";
import { PreguntasSuperAdmin } from "./PreguntasSuperAdmin";
import { PreguntasAdmin } from "./PreguntasAdmin";

export default function Preguntas() {
    const { user } = useAuthStore();

    // SuperAdmin (i_rol === 1) ve la vista completa con CRUD
    // Admin (i_rol === 2) ve solo lectura de las preguntas de su cliente
    if (user?.i_rol === 1) {
        return <PreguntasSuperAdmin />;
    }

    return <PreguntasAdmin />;
}
