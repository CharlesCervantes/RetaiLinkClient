export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export interface FormData {
    id_user: number,    name: string,
    store_code?: string,
    id_channel_sale?: number,
    address?: {
        entity_type: string
        entity_id: number
        id_country: number
        id_state: number
        id_city: number
        street: string
        ext_number: string
        int_number?: string
        neighborhood?: string
        postal_code: string
        address_references?: string
        latitude?: number
        longitude?: number
    }
}

export interface CustomMarkerProps {
    position: google.maps.LatLngLiteral;
    imageUrl: string | null;
    storeName: string;
    onDragEnd?: (lat: number, lng: number) => void;
}

export const initialFormData: FormData = {
    id_user: 0,
    name: "",
    store_code: "",
    id_channel_sale: undefined,
    address: {
        entity_type: "store",
        entity_id: 0,
        id_country: 0,
        id_state: 0,
        id_city: 0,
        street: "",
        ext_number: "",
        int_number: "",
        neighborhood: "",
        postal_code: "",
        address_references: "",
        latitude: 0,
        longitude: 0,
    }
};

export const libraries: ("places")[] = ["places"];
export const mapContainerStyle = {
    width: "100%",
    height: "700px",
    borderRadius: "8px",
};


