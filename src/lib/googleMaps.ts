import { useJsApiLoader } from "@react-google-maps/api"

const libraries: ("maps" | "visualization")[] = ["maps", "visualization"]

export const GOOGLE_MAPS_CONFIG = {
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
}

export { useJsApiLoader }