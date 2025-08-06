import { useProductStore } from "../store/productStore";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useNavigate } from "react-router-dom";

export default function CreateProduct() {
  const {
    name,
    description,
    setName,
    setDescription,
    addProduct,
  } = useProductStore();

  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("El nombre es obligatorio");
      return;
    }
    try {
      await addProduct(); 
      navigate("/productList");
    } catch (e) {
      console.error(e);
      alert("Error al crear producto");
    }
  };

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

      {/* <div>
        <Label>URL de imagen</Label>
        <Input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://tuservidor.com/imagen.png"
        />
      </div> */}

      <Button className="mt-4" onClick={handleSubmit}>
        Guardar producto
      </Button>
    </div>
  );
}
