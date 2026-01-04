export interface User {
  id_user: number;
  email: string;
  name: string;
  lastname: string;
  i_rol: number;
  id_client?: number;  // Agrega esto si lo necesitas
  dt_register: string;
  dt_updated: string;
}