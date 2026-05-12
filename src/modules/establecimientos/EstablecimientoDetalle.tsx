import { toast } from "sonner"
import { useState, useEffect, useCallback } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { ArrowLeft, Loader2, Store as StoreIcon, MapPin, Hash, Edit, Trash2, Copy, ExternalLink } from "lucide-react"
import { GoogleMap, OverlayView } from "@react-google-maps/api";

import { Button } from "@/components";
import { GOOGLE_MAPS_CONFIG, useJsApiLoader, api, ApiResponse } from '@/lib'
import { getStoreById, Store } from "@/Fetch/establecimientos";
import { StoreDTO } from '@/dtos'


const mapContainerStyle = {
    width: "100%",
    height: "700px",
    borderRadius: "8px",
};

interface CustomMarkerProps {
    position: google.maps.LatLngLiteral;
    imageUrl: string | null;
    storeName: string;
}

function CustomMarker({ position, imageUrl, storeName }: CustomMarkerProps) {
    const MARKER_WIDTH = 120;
    const MARKER_HEIGHT = 130;

    return (
        <OverlayView
            position={position}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            getPixelPositionOffset={() => ({
                x: -(MARKER_WIDTH / 2),
                y: -MARKER_HEIGHT,
            })}
        >
            <div style={{ width: MARKER_WIDTH, position: 'relative' }}>
                {/* Tarjeta */}
                <div className="bg-white rounded-lg shadow-lg border-2 border-brand overflow-hidden">
                    {/* Imagen */}
                    <div style={{ height: 70 }} className="w-full bg-gray-100">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={storeName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <StoreIcon size={28} className="text-gray-300" />
                            </div>
                        )}
                    </div>
                    
                    {/* Nombre */}
                    <div className="px-2 py-1.5 text-center">
                        <p className="text-xs font-medium text-gray-800 truncate">
                            {storeName || "Establecimiento"}
                        </p>
                    </div>
                </div>

                {/* Flecha */}
                <div className="flex justify-center">
                    <div 
                        style={{
                            width: 0,
                            height: 0,
                            borderLeft: '10px solid transparent',
                            borderRight: '10px solid transparent',
                            borderTop: '12px solid #CBEF43',
                        }}
                    />
                </div>

                {/* Punto - ANCLA */}
                <div className="flex justify-center">
                    <div 
                        className="bg-brand rounded-full border-2 border-white shadow-md"
                        style={{ width: 12, height: 12 }}
                    />
                </div>
            </div>
        </OverlayView>
    );
}

export default function EstablecimientoDetalle() {
    const navigate = useNavigate();
    const { id_store_client } = useParams();

    const [establecimiento, setEstablecimiento] = useState<StoreDTO>();
    const [loading, setLoading] = useState(true);
    const [storeImage, setStoreImage] = useState<string | null>(null);

    const { isLoaded } = useJsApiLoader(GOOGLE_MAPS_CONFIG)

    useEffect(() => {
        if (establecimiento?.address.latitude && establecimiento?.address.longitude) {
            const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=400x300&location=${Number(establecimiento.address.latitude)},${Number(establecimiento.address.longitude)}&fov=90&heading=235&pitch=10&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
            setStoreImage(streetViewUrl);
        }
    }, [establecimiento]);

    useEffect(() => {
        setLoading(true);
        try {
            const fetch = async() => {
                const resp = await api.get<ApiResponse<StoreDTO>>(`/stores/${id_store_client}`);
                console.log(resp);
                setEstablecimiento(resp.data);
            }
            fetch()
        } catch (error) {
            console.error("error establecimiento detalle uyseeffect main");
        } finally {
            setLoading(false);
        }
    }, [id_store_client])

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copiado al portapapeles");
    };

    const getFullAddress = () => {
        if (!establecimiento) return "";
        const parts = [
            establecimiento.address.street,
            establecimiento.address.ext_number,
            establecimiento.address.int_number,
            establecimiento.address.neighborhood,
            establecimiento.address.city?.name,
            establecimiento.address.state?.name,
            establecimiento.address.postal_code,
            establecimiento.address.country?.name,
        ].filter(Boolean);
        return parts.join(", ");
    };

    const onMapLoad = useCallback((map: google.maps.Map) => {
        // Centrar el mapa en las coordenadas del establecimiento
        if (establecimiento?.address.latitude && establecimiento?.address.longitude) {
            map.setCenter({
                lat: establecimiento.address.latitude,
                lng: establecimiento.address.longitude,
            });
        }
    }, [establecimiento]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!establecimiento) {
        return (
            <div className="text-center py-12">
                <StoreIcon size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Establecimiento no encontrado</p>
                <Button className="mt-4" onClick={() => navigate("/establecimientos")}>
                    Volver a establecimientos
                </Button>
            </div>
        );
    }

    const markerPosition = {
        lat: Number(establecimiento.address.latitude),
        lng: Number(establecimiento.address.longitude),
    };

    return (
        <>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate("/establecimientos")}
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            {establecimiento.name}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Código: {establecimiento.store_code}
                        </p>
                    </div>
                </div>

                {/* <div className="flex gap-3">
                    <Link to={`/establecimiento/${id_store_client}`}>
                        <Button variant="outline">
                            <Edit size={18} className="mr-2" />
                            Editar
                        </Button>
                    </Link>
                </div> */}
            </div>

            {/* Contenido */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información General con Imagen */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {/* Imagen de Street View */}
                    <div className="w-full h-48 bg-gray-100 relative">
                        {storeImage ? (
                            <img
                                src={storeImage}
                                alt={establecimiento.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <StoreIcon size={48} className="text-gray-300" />
                            </div>
                        )}
                        {/* Badge de estado */}
                        <span
                            className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                                establecimiento.i_status
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                        >
                            {establecimiento.i_status ? "Activo" : "Inactivo"}
                        </span>
                    </div>

                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <StoreIcon size={20} className="text-gray-600" />
                            <h2 className="text-lg font-medium">Información General</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Nombre</p>
                                <p className="font-medium">{establecimiento.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Código de Tienda</p>
                                <p className="font-medium">{establecimiento.store_code}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dirección */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <MapPin size={20} className="text-gray-600" />
                            <h2 className="text-lg font-medium">Dirección</h2>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(getFullAddress())}
                        >
                            <Copy size={16} className="mr-1" />
                            Copiar
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Calle</p>
                            <p className="font-medium">{establecimiento.address.street}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Número Exterior</p>
                            <p className="font-medium">{establecimiento.address.ext_number}</p>
                        </div>
                        {establecimiento.address.int_number && (
                            <div>
                                <p className="text-sm text-gray-500">Número Interior</p>
                                <p className="font-medium">{establecimiento.address.int_number}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-gray-500">Colonia</p>
                            <p className="font-medium">{establecimiento.address.neighborhood}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Municipio</p>
                            <p className="font-medium">{establecimiento.address.city?.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Estado</p>
                            <p className="font-medium">{establecimiento.address.state?.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Código Postal</p>
                            <p className="font-medium">{establecimiento.address.postal_code}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">País</p>
                            <p className="font-medium">{establecimiento.address.country?.name}</p>
                        </div>
                    </div>
                </div>

                {/* Coordenadas */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Hash size={20} className="text-gray-600" />
                        <h2 className="text-lg font-medium">Coordenadas</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Latitud</p>
                            <p className="font-mono font-medium">{establecimiento.address.latitude}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Longitud</p>
                            <p className="font-mono font-medium">{establecimiento.address.longitude}</p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="mt-4 w-full"
                        onClick={() =>
                            window.open(
                                `https://www.google.com/maps?q=${establecimiento.address.latitude},${establecimiento.address.longitude}`,
                                "_blank"
                            )
                        }
                    >
                        <ExternalLink size={16} className="mr-2" />
                        Abrir en Google Maps
                    </Button>
                </div>

                {/* Metadatos */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-medium mb-4">Información del Sistema</h2>

                    <div className="grid grid-cols-2 gap-4">
                        {/* <div>
                            <p className="text-sm text-gray-500">Fecha de Creación</p>
                            <p className="font-medium">
                                {new Date(establecimiento.dt_register).toLocaleDateString("es-MX")}
                            </p>
                        </div> */}
                        {/* <div>
                            <p className="text-sm text-gray-500">Última Actualización</p>
                            <p className="font-medium">
                                {new Date(establecimiento.dt_updated).toLocaleDateString("es-MX")}
                            </p>
                        </div> */}
                    </div>
                </div>
            </div>

            {/* Mapa a ancho completo */}
            <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <MapPin size={20} className="text-gray-600" />
                    <h2 className="text-lg font-medium">Ubicación en el Mapa</h2>
                </div>

                {isLoaded ? (
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={markerPosition}
                        zoom={17}
                        onLoad={onMapLoad}
                        options={{
                            streetViewControl: true,
                            mapTypeControl: true,
                            fullscreenControl: true,
                        }}
                    >
                        <CustomMarker
                            position={markerPosition}
                            imageUrl={storeImage}
                            storeName={establecimiento.name}
                        />
                    </GoogleMap>
                ) : (
                    <div 
                        className="flex items-center justify-center bg-gray-100 rounded-lg"
                        style={{ height: 700 }}
                    >
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                )}
            </div>
        </>
    );
}