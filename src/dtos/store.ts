import { AddressDTO } from './address'
import { channelSaleEstablecimientoDTO } from './channel_sales'

export interface StoreDTO {
    id_store: number
    id_user: number
    id_channel_sale?: number
    name: string
    store_code?: string
    i_status: boolean,
    address: AddressDTO,
    sales_channel: channelSaleEstablecimientoDTO
}