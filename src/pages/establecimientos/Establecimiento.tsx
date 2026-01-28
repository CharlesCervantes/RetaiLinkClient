import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
    ArrowLeft,
    Save,
    Loader2,
    Store,
    MapPin,
    Hash,
    Navigation,
    ImageIcon,
    X,
    Upload,
} from "lucide-react";
import {
    GoogleMap,
    useJsApiLoader,
    OverlayView,
} from "@react-google-maps/api";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { MensajeConfirmacion } from "../../components/mensajeConfirmaacion";

import { useAuthStore } from '../../store/authStore'

import { createStorepayload, CreateStorepayload, updateStoreClient, getStoreClientById } from '../../Fetch/establecimientos';

type FormErrors = {
    [key: string]: string | null;
};

interface FormData {
    name: string;
    store_code: string;
    street: string;
    ext_number: string;
    int_number: string;
    neighborhood: string;
    municipality: string;
    state: string;
    postal_code: string;
    country: string;
    latitude: string;
    longitude: string;
}

const initialFormData: FormData = {
    name: "",
    store_code: "",
    street: "",
    ext_number: "",
    int_number: "",
    neighborhood: "",
    municipality: "",
    state: "",
    postal_code: "",
    country: "",
    latitude: "",
    longitude: "",
};

const libraries: ("places")[] = ["places"];
const mapContainerStyle = {
    width: "100%",
    height: "700px",
    borderRadius: "8px",
};

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Componente del marcador personalizado
interface CustomMarkerProps {
    position: google.maps.LatLngLiteral;
    imageUrl: string | null;
    storeName: string;
    onDragEnd?: (lat: number, lng: number) => void;
}

function CustomMarker({ position, imageUrl, storeName }: CustomMarkerProps) {
    // Dimensiones fijas del marcador
    const MARKER_WIDTH = 120;
    const MARKER_HEIGHT = 130; // Altura total hasta el punto

    return (
        <OverlayView
            position={position}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            getPixelPositionOffset={() => ({
                x: -(MARKER_WIDTH / 2), // Centrar horizontalmente
                y: -MARKER_HEIGHT,       // El punto queda exactamente en las coordenadas
            })}
        >
            <div className="relative" style={{ width: MARKER_WIDTH }}>
                {/* Contenedor del marcador */}
                <div className="bg-white rounded-lg shadow-lg border-2 border-brand overflow-hidden">
                    {/* Imagen */}
                    <div className="w-full h-[70px] bg-gray-100 relative">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={storeName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Store size={28} className="text-gray-300" />
                            </div>
                        )}
                    </div>
                    
                    {/* Nombre */}
                    <div className="px-2 py-1.5 text-center">
                        <p className="text-xs font-medium text-gray-800 truncate">
                            {storeName || "Nuevo establecimiento"}
                        </p>
                    </div>
                </div>

                {/* Flecha hacia abajo */}
                <div 
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{ top: '100%' }}
                >
                    <div 
                        className="w-0 h-0"
                        style={{
                            borderLeft: '10px solid transparent',
                            borderRight: '10px solid transparent',
                            borderTop: '12px solid #CBEF43',
                        }}
                    />
                </div>

                {/* Punto de ubicación - ESTE ES EL ANCLA */}
                <div 
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{ top: 'calc(100% + 10px)' }}
                >
                    <div className="w-3 h-3 bg-brand rounded-full border-2 border-white shadow-md" />
                </div>
            </div>
        </OverlayView>
    );
}

export default function Establecimiento() {
    const navigate = useNavigate();
    const { id_store_client: id_store } = useParams();

    const isEditMode = Boolean(id_store);

    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [originalData, setOriginalData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEditMode);
    const [showConfirm, setShowConfirm] = useState(false);
    const [idClient, setIdClient] = useState(0);

    // Google Maps states
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [showMap, setShowMap] = useState(false);

    // Imagen del establecimiento
    const [storeImage, setStoreImage] = useState<string | null>(null);
    const [useStreetView, setUseStreetView] = useState(true);
    const [customImageFile, setCustomImageFile] = useState<File | null>(null);

    const { user } = useAuthStore()

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries,
    });

    useEffect(() => {
        if (isEditMode && id_store) {
            fetchEstablecimiento();
        }
    }, [id_store]);

    // Actualizar imagen de Street View cuando cambian las coordenadas
    useEffect(() => {
        if (markerPosition && useStreetView && !customImageFile) {
            const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=200x150&location=${markerPosition.lat},${markerPosition.lng}&fov=90&heading=235&pitch=10&key=${GOOGLE_MAPS_API_KEY}`;
            setStoreImage(streetViewUrl);
        }
    }, [markerPosition, useStreetView, customImageFile]);

    const fetchEstablecimiento = async () => {
        try {
            setLoadingData(true);
            const response = await getStoreClientById(Number(id_store));

            if (!response.ok || !response.data) {
                toast.error("Error al cargar el establecimiento");
                navigate("/establecimientos");
                return;
            }

            const establecimiento = response.data;

            const formDataFromApi: FormData = {
                name: establecimiento.name || "",
                store_code: establecimiento.store_code || "",
                street: establecimiento.street || "",
                ext_number: establecimiento.ext_number || "",
                int_number: establecimiento.int_number || "",
                neighborhood: establecimiento.neighborhood || "",
                municipality: establecimiento.municipality || "",
                state: establecimiento.state || "",
                postal_code: establecimiento.postal_code || "",
                country: establecimiento.country || "",
                latitude: establecimiento.latitude?.toString() || "",
                longitude: establecimiento.longitude?.toString() || "",
            };

            setFormData(formDataFromApi);
            setOriginalData(formDataFromApi);
            setIdClient(establecimiento.id_client || 0);

            if (establecimiento.latitude && establecimiento.longitude) {
                setMarkerPosition({
                    lat: establecimiento.latitude,
                    lng: establecimiento.longitude,
                });
                setShowMap(true);
            }
        } catch (error) {
            console.error("Error al cargar establecimiento:", error);
            toast.error("Error al cargar los datos del establecimiento");
            navigate("/establecimientos");
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const buildFullAddress = (): string => {
        const parts = [
            formData.street,
            formData.ext_number,
            formData.neighborhood,
            formData.municipality,
            formData.state,
            formData.postal_code,
            formData.country,
        ].filter(Boolean);

        return parts.join(", ");
    };

    const handleLocate = async () => {
        if (!isLoaded) {
            toast.error("Google Maps no está cargado");
            return;
        }

        if (!formData.street.trim() || !formData.municipality.trim()) {
            toast.error("Ingresa al menos la calle y el municipio para localizar");
            return;
        }

        setIsLocating(true);

        const geocoder = new google.maps.Geocoder();
        const address = buildFullAddress();

        geocoder.geocode({ address }, (results, status) => {
            setIsLocating(false);

            if (status === "OK" && results && results[0]) {
                const location = results[0].geometry.location;
                const lat = location.lat();
                const lng = location.lng();

                setFormData((prev) => ({
                    ...prev,
                    latitude: lat.toFixed(6),
                    longitude: lng.toFixed(6),
                }));

                setMarkerPosition({ lat, lng });
                setShowMap(true);

                setErrors((prev) => ({
                    ...prev,
                    latitude: null,
                    longitude: null,
                }));

                toast.success("Ubicación encontrada");

                if (map) {
                    map.panTo({ lat, lng });
                    map.setZoom(18);
                }
            } else {
                toast.error("No se pudo encontrar la dirección. Verifica los datos.");
            }
        });
    };

    // Click en el mapa para mover marcador
    const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();

            setMarkerPosition({ lat, lng });
            setFormData((prev) => ({
                ...prev,
                latitude: lat.toFixed(6),
                longitude: lng.toFixed(6),
            }));
        }
    }, []);

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
    }, []);

    // Manejar imagen personalizada
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error("Solo se permiten imágenes");
                return;
            }

            setCustomImageFile(file);
            setUseStreetView(false);

            const reader = new FileReader();
            reader.onload = (event) => {
                setStoreImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);

            toast.success("Imagen cargada");
        }
    };

    const handleRemoveCustomImage = () => {
        setCustomImageFile(null);
        setUseStreetView(true);
        
        // Restaurar Street View si hay coordenadas
        if (markerPosition) {
            const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=200x150&location=${markerPosition.lat},${markerPosition.lng}&fov=90&heading=235&pitch=10&key=${GOOGLE_MAPS_API_KEY}`;
            setStoreImage(streetViewUrl);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "El nombre es requerido";
        }
        if (!formData.store_code.trim()) {
            newErrors.store_code = "El código de tienda es requerido";
        }
        if (!formData.street.trim()) {
            newErrors.street = "La calle es requerida";
        }
        if (!formData.ext_number.trim()) {
            newErrors.ext_number = "El número exterior es requerido";
        }
        if (!formData.neighborhood.trim()) {
            newErrors.neighborhood = "La colonia es requerida";
        }
        if (!formData.municipality.trim()) {
            newErrors.municipality = "El municipio es requerido";
        }
        if (!formData.state.trim()) {
            newErrors.state = "El estado es requerido";
        }
        if (!formData.postal_code.trim()) {
            newErrors.postal_code = "El código postal es requerido";
        }
        if (!formData.country.trim()) {
            newErrors.country = "El país es requerido";
        }

        if (!formData.latitude.trim() || !formData.longitude.trim()) {
            newErrors.latitude = "Debes localizar la dirección en el mapa";
            toast.error("Usa el botón 'Localizar' para obtener las coordenadas");
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const hasChanges = (): boolean => {
        return JSON.stringify(formData) !== JSON.stringify(originalData);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Por favor corrige los errores del formulario");
            return;
        }

        if (isEditMode && !hasChanges()) {
            toast.info("No hay cambios para guardar");
            return;
        }

        setShowConfirm(true);
    };

    const handleConfirmSave = async () => {
        setShowConfirm(false);
        setLoading(true);

        try {
            const store_payload: CreateStorepayload = {
                id_client: user?.i_rol === 1 ? idClient : user?.id_client || 0, 
                id_user_creator: user?.id_user || 0,
                name: formData.name,
                store_code: formData.store_code,
                street: formData.street,
                ext_number: formData.ext_number,
                int_number: formData.int_number,
                neighborhood: formData.neighborhood,
                municipality: formData.municipality,
                state: formData.state,
                postal_code: formData.postal_code,
                country: formData.country,
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
            };

            let resp;

            if (isEditMode) {
                resp = await updateStoreClient(Number(id_store), store_payload);
                
                if (resp.ok) {
                    toast.success("Establecimiento actualizado correctamente");
                } else {
                    toast.error(resp.message || "Error al actualizar");
                    return;
                }
            } else {
                resp = await createStorepayload(store_payload);
                
                if (resp.ok) {
                    toast.success("Establecimiento creado correctamente");
                } else {
                    toast.error(resp.message || "Error al crear");
                    return;
                }
            }

            navigate("/establecimientos");
        } catch (error) {
            console.error("Error al guardar:", error);
            toast.error(
                isEditMode
                    ? "Error al actualizar el establecimiento"
                    : "Error al crear el establecimiento"
            );
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">Error al cargar Google Maps</p>
            </div>
        );
    }

    return (
        <>
            <MensajeConfirmacion
                open={showConfirm}
                onOpenChange={setShowConfirm}
                onConfirm={handleConfirmSave}
                title={isEditMode ? "¿Actualizar establecimiento?" : "¿Crear establecimiento?"}
                description={
                    isEditMode
                        ? "Los cambios se guardarán en el sistema."
                        : "Se creará un nuevo establecimiento con la información proporcionada."
                }
            />

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/establecimientos")}
                >
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        {isEditMode ? "Editar Establecimiento" : "Nuevo Establecimiento"}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {isEditMode
                            ? "Modifica los datos del establecimiento"
                            : "Completa el formulario para registrar un nuevo establecimiento"}
                    </p>
                </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit}>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    {/* Información General */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Store size={20} className="text-gray-600" />
                            <h2 className="text-lg font-medium">Información General</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre del Establecimiento *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Ej: Sucursal Centro"
                                    className={errors.name ? "border-red-500" : ""}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="store_code">Código de Tienda *</Label>
                                <Input
                                    id="store_code"
                                    name="store_code"
                                    value={formData.store_code}
                                    onChange={handleChange}
                                    placeholder="Ej: SUC-001"
                                    className={errors.store_code ? "border-red-500" : ""}
                                />
                                {errors.store_code && (
                                    <p className="text-sm text-red-500">{errors.store_code}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Dirección */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin size={20} className="text-gray-600" />
                            <h2 className="text-lg font-medium">Dirección</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2 md:col-span-2 lg:col-span-2">
                                <Label htmlFor="street">Calle *</Label>
                                <Input
                                    id="street"
                                    name="street"
                                    value={formData.street}
                                    onChange={handleChange}
                                    placeholder="Ej: Av. Revolución"
                                    className={errors.street ? "border-red-500" : ""}
                                />
                                {errors.street && (
                                    <p className="text-sm text-red-500">{errors.street}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="ext_number">Número Exterior *</Label>
                                <Input
                                    id="ext_number"
                                    name="ext_number"
                                    value={formData.ext_number}
                                    onChange={handleChange}
                                    placeholder="Ej: 123"
                                    className={errors.ext_number ? "border-red-500" : ""}
                                />
                                {errors.ext_number && (
                                    <p className="text-sm text-red-500">{errors.ext_number}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="int_number">Número Interior</Label>
                                <Input
                                    id="int_number"
                                    name="int_number"
                                    value={formData.int_number}
                                    onChange={handleChange}
                                    placeholder="Ej: Local 4"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="neighborhood">Colonia *</Label>
                                <Input
                                    id="neighborhood"
                                    name="neighborhood"
                                    value={formData.neighborhood}
                                    onChange={handleChange}
                                    placeholder="Ej: Centro"
                                    className={errors.neighborhood ? "border-red-500" : ""}
                                />
                                {errors.neighborhood && (
                                    <p className="text-sm text-red-500">{errors.neighborhood}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="municipality">Municipio *</Label>
                                <Input
                                    id="municipality"
                                    name="municipality"
                                    value={formData.municipality}
                                    onChange={handleChange}
                                    placeholder="Ej: Monterrey"
                                    className={errors.municipality ? "border-red-500" : ""}
                                />
                                {errors.municipality && (
                                    <p className="text-sm text-red-500">{errors.municipality}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="state">Estado *</Label>
                                <Input
                                    id="state"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    placeholder="Ej: Nuevo León"
                                    className={errors.state ? "border-red-500" : ""}
                                />
                                {errors.state && (
                                    <p className="text-sm text-red-500">{errors.state}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="postal_code">Código Postal *</Label>
                                <Input
                                    id="postal_code"
                                    name="postal_code"
                                    value={formData.postal_code}
                                    onChange={handleChange}
                                    placeholder="Ej: 64000"
                                    className={errors.postal_code ? "border-red-500" : ""}
                                />
                                {errors.postal_code && (
                                    <p className="text-sm text-red-500">{errors.postal_code}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="country">País *</Label>
                                <Input
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    placeholder="Ej: México"
                                    className={errors.country ? "border-red-500" : ""}
                                />
                                {errors.country && (
                                    <p className="text-sm text-red-500">{errors.country}</p>
                                )}
                            </div>
                        </div>

                        {/* Botón Localizar */}
                        <div className="mt-6 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleLocate}
                                disabled={isLocating || !isLoaded}
                                className="w-full md:w-auto"
                            >
                                {isLocating ? (
                                    <>
                                        <Loader2 size={18} className="mr-2 animate-spin" />
                                        Localizando...
                                    </>
                                ) : (
                                    <>
                                        <Navigation size={18} className="mr-2" />
                                        Localizar en el mapa
                                    </>
                                )}
                            </Button>
                            <p className="text-xs text-gray-500 mt-2">
                                Llena los campos de dirección y presiona el botón para ubicar en el mapa
                            </p>
                            {errors.latitude && (
                                <p className="text-sm text-red-500 mt-2">{errors.latitude}</p>
                            )}
                        </div>
                    </div>

                    {/* Mapa y Coordenadas */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Hash size={20} className="text-gray-600" />
                            <h2 className="text-lg font-medium">Ubicación en el Mapa *</h2>
                        </div>

                        {isLoaded && showMap && markerPosition ? (
                            <div className="space-y-4">
                                {/* Opción de imagen personalizada */}
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex-shrink-0">
                                        {storeImage ? (
                                            <div className="relative">
                                                <img
                                                    src={storeImage}
                                                    alt="Preview"
                                                    className="w-24 h-24 object-cover rounded-lg border"
                                                />
                                                {customImageFile && (
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveCustomImage}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                                                <ImageIcon size={32} className="text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-700">
                                            {customImageFile ? "Imagen personalizada" : "Imagen de Street View"}
                                        </p>
                                        <p className="text-xs text-gray-500 mb-2">
                                            {customImageFile 
                                                ? "Usando tu imagen personalizada" 
                                                : "Se muestra automáticamente la vista del lugar"}
                                        </p>
                                        <label className="cursor-pointer">
                                            <span className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                                                <Upload size={14} />
                                                Subir imagen personalizada
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Mapa */}
                                <GoogleMap
                                    mapContainerStyle={mapContainerStyle}
                                    center={markerPosition}
                                    zoom={18}
                                    onLoad={onLoad}
                                    onClick={onMapClick}
                                    options={{
                                        streetViewControl: true,
                                        mapTypeControl: false,
                                        fullscreenControl: true,
                                    }}
                                >
                                    <CustomMarker
                                        position={markerPosition}
                                        imageUrl={storeImage}
                                        storeName={formData.name}
                                    />
                                </GoogleMap>
                                
                                <p className="text-xs text-gray-500">
                                    Haz clic en el mapa para ajustar la ubicación exacta
                                </p>

                                {/* Coordenadas */}
                                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-sm text-gray-500">Latitud</p>
                                        <p className="font-mono font-medium">{formData.latitude}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Longitud</p>
                                        <p className="font-mono font-medium">{formData.longitude}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[200px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                <MapPin size={48} className="text-gray-300 mb-3" />
                                <p className="text-gray-500 text-center">
                                    Completa la dirección y presiona
                                    <br />
                                    <strong>"Localizar en el mapa"</strong>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/establecimientos")}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="mr-2 animate-spin" />
                                    {isEditMode ? "Actualizando..." : "Guardando..."}
                                </>
                            ) : (
                                <>
                                    <Save size={18} className="mr-2" />
                                    {isEditMode ? "Actualizar" : "Guardar"}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </>
    );
}