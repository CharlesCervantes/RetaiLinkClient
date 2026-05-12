export interface AddressDTO {
    id: number
    entity_type: string
    entity_id: number
    id_country?: number
    id_state?: number
    id_city?: number
    street?: string
    ext_number?: string
    int_number?: string
    neighborhood?: string
    postal_code?: string
    address_references?: string
    latitude?: number
    longitude?: number
    is_active: boolean
    created_at: string
    updated_at: string
    city?: CityDTO
    state?: StateDTO
    country?: CountryDTO
}

export interface CountryDTO {
    id: number
    name: string
}

export interface StateDTO {
    id: number
    name: string
}

export interface CityDTO {
    id: number
    name: string
}