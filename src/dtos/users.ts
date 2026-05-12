export interface UsuarioDTO{
    id_user: number
    email: string
    password: string
    i_rol: number
    i_status: number
    dt_register: string,
    dt_updated: string
    name: string,
    lastname?: string
    reset_password_token?: string
    reset_password_expires?: string
    id_client: number
    id_user_creator: number
}