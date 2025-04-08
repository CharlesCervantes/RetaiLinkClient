// src/pages/Login.tsx
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export const Login = () => {
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()
  const [email, setEmail] = useState("")

  const handleSubmit = () => {
    if (!email.trim()) return
    // Simulacion aqui va el backend
    login(email, "DemoOrg")
    navigate("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm space-y-6 p-6 bg-white shadow-md rounded">
        <h1 className="text-xl font-bold text-center">Iniciar sesión</h1>
        <Input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button onClick={handleSubmit} className="w-full">
          Iniciar sesión
        </Button>
      </div>
    </div>
  )
}
