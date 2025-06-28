import { useProductStore } from "@/store/productStore"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export const ProductList = () => {
  const { products } = useProductStore()
  const navigate = useNavigate()

  return (
    <div className="w-full px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Productos registrados</h1>
        <Button onClick={() => navigate("/createProduct")}>
          Agregar producto
        </Button>
      </div>

      {products.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No hay productos registrados aún.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Imágenes</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.description}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                  {Array.isArray(p.images) &&
                    p.images.map((img, i) =>
                      img instanceof File ? (
                        <img
                          key={i}
                          src={URL.createObjectURL(img)}
                          alt={`img-${i}`}
                          className="w-16 h-16 object-cover rounded border"
                        />
                      ) : null
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
