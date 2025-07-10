const API_URL = import.meta.env.VITE_API_URL;

export const loginUser = async (vc_username: string, vc_password: string) => {
    const res = await fetch(
      `${API_URL}/admin/login-user`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vc_username, vc_password }),
      }
    );
    if (!res.ok) throw new Error("Credenciales inválidas");
    return res.json();
  };
  
