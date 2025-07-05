import { useProductStore } from '@/store/productStore'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'

export default function CreateProduct() {
  const {
    name,
    description,
    images,
    setName,
    setDescription,
    addImage,
    removeImage,
    addProduct
  } = useProductStore()

  const navigate = useNavigate()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      addImage(file)
    }
  }

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('El nombre es obligatorio')
      return
    }
    addProduct()
    navigate('/productList')
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
          placeholder="Opcional, solo visible para ti"
        />
      </div>

      <div>
        <Label>Imágenes (máximo 3)</Label>
        <Input type="file" accept="image/*" onChange={handleImageUpload} />
        <div className="flex gap-4 mt-2 flex-wrap">
          {images.map((img, index) => (
            <div key={index} className="relative w-24 h-24">
              <img
                src={URL.createObjectURL(img)}
                alt={`imagen-${index}`}
                className="w-full h-full object-cover rounded border"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-white border rounded-full p-1 shadow"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <Button className="mt-4" onClick={handleSubmit}>
        Guardar producto
      </Button>
    </div>
  )
}
