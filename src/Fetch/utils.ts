const API_URL = import.meta.env.VITE_API_URL;

export const getPaises = async () => {
    try {
        const res = await fetch(`${API_URL}/admin/countries`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error("Error al obtener países");

        return res.json();
    } catch (error) {
        console.error("f.registClient:", error);
    }
};

export const getEstados = async (id_country: number) => {
    try {
        const res = await fetch(`${API_URL}/admin/states/${id_country}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error("Error al obtener estados");

        return res.json();
    } catch (error) {
        console.error("f.getEstados:", error);
    }
};

export const getCiudades = async (id_country: number, id_state: number) => {
    try {
        const res = await fetch(`${API_URL}/admin/cities/${id_country}/${id_state}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error("Error al obtener ciudades");

        return res.json();
    } catch (error) {
        console.error("f.getCiudades:", error);
    }
};
