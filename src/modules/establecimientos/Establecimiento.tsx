import { toast } from "sonner"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Store, MapPin, Map } from "lucide-react"
import { GoogleMap } from "@react-google-maps/api"


import { api, ApiResponse, useJsApiLoader, GOOGLE_MAPS_CONFIG } from '@/lib'
import { useAuthStore } from '@/stores'
import { Button, Input, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components'
import { FormData, initialFormData } from './utils'
import { CountryDTO, StateDTO, CityDTO, channelSalesDTO } from '@/dtos'
import { CustomMarker } from './components/CustomMarker'


export default function Establecimiento() {
    const navigate = useNavigate()
    const { user } = useAuthStore()

    const [formData, setFormData] = useState<FormData>(initialFormData)
    const [countries, setCountries] = useState<CountryDTO[]>()
    const [states, setStates] = useState<StateDTO[]>()
    const [cities, setCities] = useState<CityDTO[]>()
    const [channels, setChannels] = useState<channelSalesDTO[]>()

    const [mapCenter, setMapCenter] = useState({ lat: 25.7460, lng: -100.2792 }) 
    const [markerPosition, setMarkerPosition] = useState<{lat: number, lng: number} | null>(null)

    const { isLoaded } = useJsApiLoader(GOOGLE_MAPS_CONFIG)

    useEffect(() => {
        try {
           const fetchData = async () => {
            const request = await api.get<ApiResponse<channelSalesDTO[]>>('/channel-sales/')
            setChannels(request.data)
           }
           
           fetchData() 
        } catch (error) {
            toast.error("Error al cargar los canales de venta")
        }
    }, [])

    useEffect(() => {
        try {
            const fetchData = async () => {
                const request = await api.get<ApiResponse<CountryDTO[]>>('/clients/countries')
                setCountries(request.data);
            }
            fetchData()
        } catch (error) {
            toast.error("Error al cargar los paises")
        }
    }, []);

    useEffect(() => {
        try {
            const fetchData = async () => {
                const request = await api.get<ApiResponse<CountryDTO[]>>(`/clients/states/${formData.address?.id_country}`)
                setStates(request.data)
            }
            fetchData()
        } catch (error) {
            toast.error("Error al cargar los paises")
        }
    }, [formData.address?.id_country]);

    useEffect(() => {
        try {
            const fetchData = async () => {
                const request = await api.get<ApiResponse<CountryDTO[]>>(`/clients/cities/${formData.address?.id_state}`)
                setCities(request.data)
            }
            fetchData()
        } catch (error) {
            toast.error("Error al cargar los paises")
        }
    }, [formData.address?.id_state]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        formData.id_user = user?.id_user ?? 0;

        try {
            console.log("fomulario: ", formData);
            const res = await api.post<ApiResponse<any>>(`/stores/`, formData);

            if(res.error && res.error > 0){
                toast.error("Error al crear el establecimiento");
            }

            navigate("/establecimientos");
            toast.success("Establecimiento creado correctamente");
        } catch (error) {
            console.error("f.handlesubmit: ", error);
        }

    };

    const handleLocate = () => {
        if (!isLoaded || !window.google) {
            toast.error("El mapa aún no está listo")
            return
        }

        const addressParts = []
        
        if (formData.address?.street) addressParts.push(formData.address.street)
        if (formData.address?.ext_number) addressParts.push(formData.address.ext_number)
        if (formData.address?.neighborhood) addressParts.push(formData.address.neighborhood)

        const cityName = cities?.find(c => c.id === formData.address?.id_city)?.name
        const stateName = states?.find(s => s.id === formData.address?.id_state)?.name
        const countryName = countries?.find(c => c.id === formData.address?.id_country)?.name

        if (cityName) addressParts.push(cityName)
        if (stateName) addressParts.push(stateName)
        if (countryName) addressParts.push(countryName)

        const addressString = addressParts.join(", ")

        if (!addressString || addressParts.length < 2) {
            toast.error("Por favor ingresa más detalles en la dirección para localizarla")
            return
        }

        const geocoder = new window.google.maps.Geocoder()
        
        geocoder.geocode({ address: addressString }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                const location = results[0].geometry.location
                const newPos = { lat: location.lat(), lng: location.lng() }
                
                setMapCenter(newPos)
                setMarkerPosition(newPos)
                
                setFormData((prev) => ({
                    ...prev,
                    address: prev.address ? {
                        ...prev.address,
                        latitude: newPos.lat,
                        longitude: newPos.lng
                    } : undefined
                } as FormData))
                
                toast.success("Dirección localizada en el mapa")
            } else {
                toast.error("No se pudo encontrar la ubicación exacta. Intenta ser más específico.")
            }
        })
    }

    const onMapClick = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() }
            setMarkerPosition(newPos)
            setFormData((prev) => ({
                ...prev,
                address: prev.address ? {
                    ...prev.address,
                    latitude: newPos.lat,
                    longitude: newPos.lng
                } : undefined
            } as FormData))
        }
    }

    return (
        <>

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
                        {"Nuevo Establecimiento"}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {"Completa el formulario para registrar un nuevo establecimiento"}
                    </p>
                </div>
            </div>

            <div className="flex justify-end mb-6 mr-6">
                <Button onClick={handleSubmit}>Guardar</Button>
            </div>

             <form onSubmit={handleSubmit}>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Store size={20} className="text-gray-600" /> <h2 className="text-lg font-medium">Información General</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre del Establecimiento *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={(e) => {
                                        setFormData((prev) => ({
                                            ...prev, name: e.target.value
                                        }))
                                    }}
                                    placeholder="Ej: Sucursal Centro"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="store_code">Código de Tienda *</Label>
                                <Input
                                    id="store_code"
                                    name="store_code"
                                    value={formData.store_code}
                                    onChange={(e) => {
                                        setFormData((prev) => ({
                                            ...prev, store_code: e.target.value
                                        }))
                                    }}
                                    placeholder="Ej: SUC-001"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="id_channel_sale">Canal de Venta (Opcional)</Label>
                                <Select
                                    name="id_channel_sale"
                                    value={formData.id_channel_sale ? String(formData.id_channel_sale) : undefined}
                                    onValueChange={(value) => {
                                        setFormData((prev) => ({
                                            ...prev, 
                                            id_channel_sale: Number(value)
                                        }))
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un canal de venta..." />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {channels?.map((channel) => (
                                            <SelectItem key={channel.id} value={String(channel.id)}>
                                                <div className="flex items-center gap-2">
                                                    {channel.url_image && (
                                                        <img 
                                                            src={channel.url_image} 
                                                            alt={channel.name} 
                                                            className="w-8 h-8 object-contain rounded-full bg-white border border-gray-100"
                                                        />
                                                    )}
                                                    <span className="capitalize">{channel.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin size={20} className="text-gray-600" />
                            <h2 className="text-lg font-medium">Dirección</h2>
                        </div>


                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="country">Pais *</Label>
                                <Select
                                    name="country"
                                    value={formData.address?.id_country ? String(formData.address.id_country) : ""}
                                    onValueChange={(valorSeleccionado) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            address: prev.address ? {
                                                ...prev.address,
                                                id_country: Number(valorSeleccionado)
                                            } : undefined
                                        } as FormData));
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un país..." />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {countries?.map((c) => (
                                            <SelectItem value={String(c.id)}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="state">Estado *</Label>
                                <Select
                                    name="state"
                                    value={formData.address?.id_state ? String(formData.address.id_state) : ""}
                                    onValueChange={(value) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            address: prev.address ? {
                                                ...prev.address,
                                                id_state: Number(value)
                                            } : undefined
                                        } as FormData));
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un estado..." />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {states?.map((s) => (
                                            <SelectItem value={String(s.id)}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="postal_code">Codigo postal *</Label>
                                <Input
                                    id="postal_code"
                                    name="postal_code"
                                    value={formData.address?.postal_code ?? ""}
                                    placeholder=""
                                    onChange={(e) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            address: prev.address ? {
                                                ...prev.address,
                                                postal_code: e.target.value
                                            } : undefined
                                        } as FormData));
                                    }}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="city">Ciudad *</Label>
                                <Select
                                name="city"
                                    value={formData.address?.id_city ? String(formData.address.id_city) : ""}
                                    onValueChange={(value) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            address: prev.address ? {
                                                ...prev.address,
                                                id_city: Number(value)
                                            } : undefined
                                        } as FormData));
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una ciudad..." />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {cities?.map((c) => (
                                            <SelectItem value={String(c.id)}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="neighborhood">Colonia *</Label>
                                <Input
                                    id="neighborhood"
                                    name="neighborhood"
                                    value={formData.address?.neighborhood ?? ""}
                                    placeholder="Ej: Centro, Polanco, Del Valle..."
                                    onChange={(e) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            address: prev.address ? {
                                                ...prev.address,
                                                neighborhood: e.target.value
                                            } : undefined
                                        } as FormData));
                                    }}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="street">Calle *</Label>
                                <Input
                                    id="street"
                                    name="street"
                                    value={formData.address?.street ?? ""}
                                    placeholder=""
                                    onChange={(e) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            address: prev.address ? {
                                                ...prev.address,
                                                street: e.target.value
                                            } : undefined
                                        } as FormData));
                                    }}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="ext_number">Numero exterior *</Label>
                                <Input
                                    id="ext_number"
                                    name="ext_number"
                                    value={formData.address?.ext_number ?? ""}
                                    placeholder=""
                                    onChange={(e) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            address: prev.address ? {
                                                ...prev.address,
                                                ext_number: e.target.value
                                            } : undefined
                                        } as FormData));
                                    }}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="int_number">Numero interior *</Label>
                                <Input
                                    id="int_number"
                                    name="int_number"
                                    value={formData.address?.int_number ?? ""}
                                    placeholder=""
                                    onChange={(e) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            address: prev.address ? {
                                                ...prev.address,
                                                int_number: e.target.value
                                            } : undefined
                                        } as FormData));
                                    }}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address_references">Referencias</Label>
                                <Input
                                    type="text"
                                    id="address_references"
                                    name="address_references"
                                    value={formData.address?.address_references ?? ""}
                                    placeholder=""
                                    onChange={(e) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            address: prev.address ? {
                                                ...prev.address,
                                                address_references: e.target.value
                                            } : undefined
                                        } as FormData));
                                    }}
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-2 flex flex-col gap-4">
                                <Button 
                                    type="button" 
                                    variant="secondary"
                                    onClick={handleLocate}
                                    className="w-full md:w-auto self-start flex items-center gap-2"
                                >
                                    <Map size={18} />
                                    Localizar en el mapa
                                </Button>

                                <p className="text-xs text-gray-500 text-right">
                                    * Puedes hacer clic en el mapa para ajustar la ubicación exacta del establecimiento.
                                </p>

                                <div className="h-[400px] w-full rounded-md border border-gray-200 overflow-hidden bg-gray-50 relative">
                                    {isLoaded ? (
                                        <GoogleMap
                                            mapContainerStyle={{ width: '100%', height: '100%' }}
                                            center={mapCenter}
                                            zoom={markerPosition ? 17 : 13}
                                            onClick={onMapClick}
                                            options={{
                                                disableDefaultUI: true,
                                                zoomControl: true,
                                                streetViewControl: false,
                                                mapTypeControl: false,
                                            }}
                                        >
                                            {markerPosition && (
                                                <CustomMarker 
                                                    position={markerPosition}
                                                    storeName={formData.name || "Nuevo Establecimiento"}
                                                    imageUrl={channels?.find(c => c.id === formData.id_channel_sale)?.url_image || ''}
                                                />
                                            )}
                                        </GoogleMap>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                                            Cargando mapa de Google...
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}