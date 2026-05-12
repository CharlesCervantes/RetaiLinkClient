import { AddressDTO } from './address'

export interface ClientDTO {
    id_client: number
    id_user: number
    name: string
    vc_initialism: string
    i_status: number
    dt_register: string
    dt_updated: string
    rfc?: string
    email?: string
    phone?: string
    address?: AddressDTO
    city?: string
    addiccional_notes?: string
    vc_url_situacion_fiscal?: string | null
}

export interface CreateUserInCLientDetailDTO {
  id_user: number;
  email: string;
  i_rol: number;
  i_status: number;
  dt_register: string;
  dt_updated: string;
  name: string;
  lastname: string;
  id_client: number;
  id_user_creator: number;
}

export interface ClientListDTO extends ClientDTO {
    i_cant_usuarios: number
}

