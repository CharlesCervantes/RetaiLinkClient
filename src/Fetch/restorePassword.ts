// const API_URL = import.meta.env.VITE_API_URL;

// Solicitar email de recuperación
export const requestPasswordReset = async (email: string) => {
  // MOCK - Simula envío exitoso después de 1 segundo
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("Mock: Enviando email de recuperación a:", email);
  return { success: true, message: "Email enviado correctamente" };

  /* CUANDO TENGAS EL BACKEND, DESCOMENTA ESTO:
  const res = await fetch(`${API_URL}/auth/request-password-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Error al enviar email de recuperación");
  return res.json();
  */
};

// Restablecer contraseña con token
export const resetPassword = async (token: string, newPassword: string) => {
  // MOCK - Simula reseteo exitoso después de 1 segundo
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("Mock: Restableciendo contraseña con token:", token);
  return { success: true, message: "Contraseña actualizada correctamente" };

  /* CUANDO TENGAS EL BACKEND, DESCOMENTA ESTO:
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
  if (!res.ok) throw new Error("Error al restablecer contraseña");
  return res.json();
  */
};
