import { useProductStore } from "../store/productStore";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../components/ui/table";

export default function ProductList() {
  const { products, fetchProducts } = useProductStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts]);
  

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
              <TableHead>Imagen</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id_producto}>
                <TableCell>{p.vc_nombre}</TableCell>
                <TableCell>{p.vc_descripcion}</TableCell>
                <TableCell>
                  {p.vc_image_url ? (
                    <img
                      src={p.vc_image_url}
                      alt={p.vc_nombre}
                      className="w-16 h-16 object-cover rounded border"
                    />
                  ) : (
                    <span className="text-muted-foreground text-xs">Sin imagen</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
