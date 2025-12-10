const API_URL = import.meta.env.VITE_API_URL;

export const requestPasswordReset = async (email: string) => {
  try {
    const res = await fetch(`${API_URL}/admin/restore-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error("Error al enviar email de recuperación");
    return res.json();
  } catch (error) {
    console.error("Error al enviar email de recuperación:", error);
    throw error;
  }
};

// Restablecer contraseña con token
export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const res = await fetch(`${API_URL}/admin/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Error al restablecer contraseña");
    }

    return res.json();
  } catch (error) {
    console.error("Error al restablecer contraseña:", error);
    throw error;
  }
};
