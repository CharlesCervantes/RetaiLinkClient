import { useProductStore } from "@/store/productStore"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2 } from "lucide-react"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog"
import { useState } from "react"

export const ProductList = () => {
  const { products, deleteProduct } = useProductStore()
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const navigate = useNavigate()

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mis Productos</h1>
        <Button onClick={() => navigate("/createProduct")}>+ Agregar producto</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="relative group">
              <Card>
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {product.image && (
                    <img
                      src={product.image.previewUrl}
                      alt={product.name}
                      className="w-full h-40 object-cover rounded"
                    />
                  )}
                  {product.description && (
                    <p className="text-sm text-muted-foreground">
                      {product.description}
                    </p>
                  )}
                  <p className="text-sm">Campos: {product.fields.length}</p>
                </CardContent>
              </Card>

              {/* Botón eliminar */}
              <button
                onClick={() => setProductToDelete(product.id)}
                className="absolute top-2 right-2 p-1 rounded hover:bg-red-100 text-red-600 group-hover:visible invisible transition"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-full">Aún no tienes productos creados.</p>
        )}
      </div>

      {/* Modal para confirmar eliminación */}
      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este producto?</AlertDialogTitle>
          </AlertDialogHeader>
          <p>Esta acción no se puede deshacer.</p>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (productToDelete) {
                  deleteProduct(productToDelete)
                  setProductToDelete(null)
                }
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
