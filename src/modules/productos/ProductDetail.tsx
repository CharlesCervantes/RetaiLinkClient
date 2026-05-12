import { toast } from "sonner"
import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Package, FileText, Edit2, Trash2, Clock, ImageOff, Loader2 } from "lucide-react"


import { ProductDTO } from "@/dtos"
import { api, ApiResponse } from "@/lib"
import { MensajeConfirmacion } from "@/components"


export default function ProductoDetalle() {
  const navigate = useNavigate();
  const { id_product } = useParams();
  

  const [product, setProduct] = useState<ProductDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [_deleting, setDeleting] = useState(false);


  const id_client = product?.id_client;


  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/products/${id_product}`);
      toast.success("Producto eliminado exitosamente");
      navigate(`/productos/`);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Error al eliminar el producto");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const resp = await api.get<ApiResponse<ProductDTO>>(`/products/product/${id_product}`)
        setProduct(resp.data)
      } catch (error) {
        console.error("Error fetching product):", error);
        toast.error("Error al cargar el producto");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id_product]);


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-gray-400" />
          <p className="text-gray-500">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Producto no encontrado</p>
          <Link
            to={`/clientes/${id_client}/productos`}
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            Volver a productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={`/productos`}>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Detalle del Producto
                </h1>
                <p className="text-sm text-gray-500">
                  Información completa del producto
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link to={`/producto/${id_product}`}>
                <button className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <Edit2 size={16} />
                  Editar
                </button>
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-red-600 bg-white border border-gray-200 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Card Principal */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Imagen */}
              <div className="flex-shrink-0">
                {product.vc_image ? (
                  <img
                    src={product.vc_image}
                    alt={product.name}
                    className="w-48 h-48 object-cover rounded-lg border border-gray-200"
                  />
                ) : (
                  <div className="w-48 h-48 bg-gray-100 rounded-lg border border-gray-200 flex flex-col items-center justify-center">
                    <ImageOff size={48} className="text-gray-300 mb-2" />
                    <span className="text-sm text-gray-400">Sin imagen</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {product.name}
                    </h2>
                    {product.i_status === 1 ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-sm font-medium rounded-full">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        Inactivo
                      </span>
                    )}
                  </div>
                </div>

                {/* ID del producto */}
                <p className="text-sm text-gray-400 mt-4">
                  ID: {product.id_product}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de información */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Descripción */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <FileText size={20} className="text-gray-400" />
                Descripción
              </h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                {product.description ? (
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {product.description}
                  </p>
                ) : (
                  <p className="text-gray-400 italic">Sin descripción</p>
                )}
              </div>
            </div>
          </div>

          {/* Columna lateral */}
          <div className="space-y-6">
            {/* Fechas */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Clock size={18} className="text-gray-400" />
                Fechas
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Fecha de creación</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(product.dt_created)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Última actualización</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(product.dt_updated)}
                  </p>
                </div>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Package size={18} className="text-gray-400" />
                Acciones
              </h3>
              <div className="space-y-2">
                <Link
                  to={`/producto/${id_product}`}
                  className="w-full px-4 py-2.5 text-left text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-3"
                >
                  <Edit2 size={18} className="text-gray-400" />
                  <span>Editar producto</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      <MensajeConfirmacion
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="¿Eliminar producto?"
        description="Esta acción desactivará el producto. Podrás reactivarlo más tarde si es necesario."
        onConfirm={handleDelete}
      />
    </div>
  );
}