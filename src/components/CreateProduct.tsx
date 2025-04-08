import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useProductStore } from "@/store/productStore"

export const CreateProduct = () => {
  const navigate = useNavigate()
  const { addProduct, updateProductImage, addFieldToProduct } = useProductStore()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [productId, setProductId] = useState<string | null>(null)

  const [fieldType, setFieldType] = useState<"text" | "number" | "date" | "quality">("text")
  const [fieldLabel, setFieldLabel] = useState("")
  const [requiresImage, setRequiresImage] = useState(false)
  const [fields, setFields] = useState<any[]>([])

  const ensureProductId = () => {
    if (!productId) {
      const id = addProduct({ name, description })
      setProductId(id)
      return id
    }
    return productId
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const id = ensureProductId()
    updateProductImage(id, file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleAddField = () => {
    if (!fieldLabel.trim()) return

    const id = ensureProductId()

    const newField = {
      type: fieldType,
      label: fieldLabel,
      requiresImage,
    }

    addFieldToProduct(id, newField)
    setFields((prev) => [...prev, newField])
    setFieldLabel("")
    setRequiresImage(false)
  }

  const handleSave = () => {
    navigate("/pructList") // Volver a la lista de productos
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      {/* Constructor lado izquierdo */}
      <div className="w-full md:w-2/3 space-y-6">
        <div>
          <h2 className="text-xl font-bold">Crear nuevo producto</h2>
        </div>

        <div>
          <label className="block text-sm font-medium">Nombre del producto</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium">Descripción (El usuario no ve este campo)</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium">Imagen del producto</label>
          <Input type="file" accept="image/*" onChange={handleImageChange} />
          {imagePreview && (
            <img src={imagePreview} className="w-32 h-32 object-cover mt-2 rounded" />
          )}
        </div>

        <div className="border-t pt-4 space-y-4">
          <h4 className="font-semibold">Preguntas que contestara el usuario</h4>

          <div className="flex gap-2 items-end">
            <Select value={fieldType} onValueChange={(val) => setFieldType(val as any)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Tipo de campo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Texto</SelectItem>
                <SelectItem value="number">Cantidad</SelectItem>
                <SelectItem value="date">Fecha</SelectItem>
                <SelectItem value="quality">Calidad</SelectItem>
              </SelectContent>
            </Select>

            <Input
              value={fieldLabel}
              onChange={(e) => setFieldLabel(e.target.value)}
              placeholder="Formula tu pregunta al usuario"
              className="flex-1"
            />

            <div className="flex items-center gap-2">
              <Checkbox
                checked={requiresImage}
                onCheckedChange={(val: boolean) => setRequiresImage(val)}
              />
              <span className="text-sm">¿Imagen de evidencia a tu pregunta?</span>
            </div>

            <Button onClick={handleAddField} disabled={!fieldLabel.trim()}>
              Agregar pregunta
            </Button>
          </div>

          <ul className="list-disc pl-4 text-sm">
            {fields.map((field, i) => (
              <li key={i}>
                {field.label} ({field.type}) {field.requiresImage ? "📷" : ""}
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-4">
          <Button onClick={handleSave} disabled={!productId}>
            Guardar producto
          </Button>
        </div>
      </div>

      {/* Vista previa móvil */}
      <div className="w-full md:w-1/3">
        <h4 className="text-center font-semibold mb-2">Vista previa móvil usuario</h4>
        <div className="relative w-[320px] h-[640px] mx-auto bg-white rounded-[2.5rem] shadow-xl border-4 border-black overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-10" />
          <div className="relative z-0 h-full p-4 space-y-4 overflow-auto">
            <CardHeader>
              <CardTitle>{name || "Nombre del producto"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {imagePreview && (
                <img src={imagePreview} className="w-full h-auto max-h-48 object-contain mx-auto rounded" />
              )}

              {fields.map((field, i) => (
                <div key={i}>
                  <label className="text-sm font-medium">{field.label}</label>
                  <div className="mt-1">
                    {field.type === "text" && <Input disabled placeholder="Texto..." />}
                    {field.type === "number" && <Input type="number" disabled placeholder="0" />}
                    {field.type === "date" && <Input type="date" disabled />}
                    {field.type === "quality" && (
                      <select disabled className="w-full border rounded p-2 text-sm">
                        <option value="">Seleccione</option>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n}>{n}</option>
                        ))}
                      </select>
                    )}
                    {field.requiresImage && (
                      <div className="mt-2 text-xs text-muted-foreground border rounded p-2 text-center">
                        Subir imagen (evidencia)
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </div>
        </div>
      </div>
    </div>
  )
}
