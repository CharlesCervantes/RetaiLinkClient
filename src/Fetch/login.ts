const API_URL = import.meta.env.VITE_API_URL;

export const loginUser = async (vc_username: string, vc_password: string) => {
  const res = await fetch(`${API_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vc_username, vc_password }),
  });
  if (!res.ok) throw new Error("Credenciales inválidas");
  return res.json();
};

export const registerUser = async (userData: {
  vc_username: string;
  vc_password: string;
  vc_nombre: string;
  id_negocio: number;
  i_rol: number;
}) => {
  const res = await fetch(`${API_URL}/superadmin/register-user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error("Error al registrar usuario");
  return res.json();
};
