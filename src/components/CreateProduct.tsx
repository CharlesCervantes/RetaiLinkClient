import { useProductStore } from "../store/productStore"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { useNavigate } from "react-router-dom"
// opcional: si usas sonner
// import { toast } from "sonner"

export default function CreateProduct() {
  const {
    name,
    description,
    imageUrl,
    setName,
    setDescription,
    setImageUrl,
    addProduct,
    resetForm,
    loading,
  } = useProductStore()

  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("El nombre es obligatorio")
      // toast.error("El nombre es obligatorio")
      return
    }
    try {
      await addProduct()
      resetForm()
      navigate("/productList")
    } catch (e: any) {
      console.error(e)
      alert(e?.message || "Error al crear producto")
      // toast.error(e?.message || "Error al crear producto")
    }
  }

  return (
    <div className="max-w-4xl px-6 py-6 space-y-4">
      <h1 className="text-xl font-bold">Crear nuevo producto</h1>

      <div>
        <Label>Nombre del producto</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Refresco Coca-Cola 600ml"
        />
      </div>

      <div>
        <Label>Descripción</Label>
        <textarea
          className="border rounded p-2 w-full"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Opcional"
        />
      </div>

      {/* Si quieres capturar URL de imagen ya mismo */}
      <div>
        <Label>URL de imagen (opcional)</Label>
        <Input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://tuservidor.com/imagen.png"
        />
      </div>

      <Button className="mt-4" onClick={handleSubmit} disabled={loading}>
        {loading ? "Guardando..." : "Guardar producto"}
      </Button>
    </div>
  )
}
