// pages/ProductoForm.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Package,
  FileText,
  Save,
  AlertCircle,
  ImagePlus,
  X,
  Loader2,
} from "lucide-react";

import { MensajeConfirmacion } from "../../../components/mensajeConfirmaacion";
import { 
  createProduct, 
  uploadProductImage, 
  getProductById,
  updateProduct
} from "../../../Fetch/products";
import { useAuthStore } from "../../../store/authStore";

type FormErrors = {
  [key: string]: string | null;
};

export default function ProductoForm() {
  const navigate = useNavigate();
  const { id_client, id_product } = useParams();
  const { user } = useAuthStore();

  // Detectar si es modo edición
  const isEditMode = Boolean(id_product);

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [showConfirm, setShowConfirm] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageChanged, setImageChanged] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [originalData, setOriginalData] = useState({
    name: "",
    description: "",
    vc_image: "",
  });

  // Cargar datos si es modo edición
  useEffect(() => {
    if (isEditMode && id_product) {
      fetchProduct();
    }
  }, [id_product]);

  const fetchProduct = async () => {
    try {
      setLoadingData(true);
      const response = await getProductById(Number(id_product));
      const product = response.data;

      setFormData({
        name: product.name || "",
        description: product.description || "",
      });

      setOriginalData({
        name: product.name || "",
        description: product.description || "",
        vc_image: product.vc_image || "",
      });

      if (product.vc_image) {
        setImagePreview(product.vc_image);
      }
    } catch (error) {
      console.error("Error cargando producto:", error);
      toast.error("Error al cargar el producto");
      navigate(-1);
    } finally {
      setLoadingData(false);
    }
  };

  const hasChanges = () => {
    return (
      formData.name !== originalData.name ||
      formData.description !== originalData.description ||
      imageChanged
    );
  };

  const haveData = Boolean(
    formData.name.trim() ||
    formData.description.trim() ||
    imageFile
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Solo se permiten archivos de imagen");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen no debe superar los 5MB");
        return;
      }

      setImageFile(file);
      setImageChanged(true);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setImageChanged(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let productId = Number(id_product);

      if (isEditMode) {
        // Modo edición: actualizar producto
        await updateProduct(productId, {
          name: formData.name,
          description: formData.description || undefined,
        });

        // Si cambió la imagen, subirla
        if (imageChanged && imageFile) {
          await uploadProductImage(productId, Number(id_client), imageFile);
        }

        toast.success("Producto actualizado exitosamente");
      } else {
        // Modo creación: crear producto
        const result = await createProduct({
          id_user: user?.id_user!,
          id_client: Number(id_client),
          name: formData.name,
          description: formData.description || undefined,
        });

        productId = result.data.id;

        // Si hay imagen, subirla
        if (imageFile) {
          try {
            await uploadProductImage(productId, Number(id_client), imageFile);
          } catch (imageError) {
            console.error("Error subiendo imagen:", imageError);
            toast.warning("Producto creado, pero hubo un error al subir la imagen");
          }
        }

        toast.success("Producto creado exitosamente");
      }

      navigate(`/clientes/${id_client}/productos`);
    } catch (error) {
      console.error("Error:", error);
      toast.error(isEditMode ? "Error al actualizar producto" : "Error al crear producto");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const shouldConfirm = isEditMode ? hasChanges() : haveData;
    
    if (shouldConfirm) {
      setShowConfirm(true);
    } else {
      navigate(-1);
    }
  };

  const handleConfirmCancel = () => {
    setShowConfirm(false);
    navigate(-1);
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Loading inicial para modo edición
  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-gray-400" />
          <p className="text-gray-500">Cargando producto...</p>
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
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {isEditMode ? "Editar Producto" : "Nuevo Producto"}
                </h1>
                <p className="text-sm text-gray-500">
                  {isEditMode 
                    ? "Modifica la información del producto" 
                    : "Completa la información del producto"
                  }
                </p>
              </div>
            </div>

            <button
              type="submit"
              form="producto-form"
              disabled={loading || (isEditMode && !hasChanges())}
              className="px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {isEditMode ? "Guardando..." : "Creando..."}
                </>
              ) : (
                <>
                  <Save size={18} />
                  {isEditMode ? "Guardar cambios" : "Crear producto"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <form id="producto-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Producto */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Package size={20} className="text-gray-600" />
              <h2 className="text-lg font-medium text-gray-900">
                Información del Producto
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej: Shampoo Anti-caspa 500ml"
                  className={`w-full px-4 py-2.5 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors ${
                    errors.name
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  }`}
                />
                {errors.name && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                    <AlertCircle size={14} />
                    {errors.name}
                  </div>
                )}
              </div>

              {/* Imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen del Producto
                </label>
                
                {imagePreview ? (
                  <div className="relative w-40 h-40">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                    {/* Botón para cambiar imagen */}
                    <label className="absolute bottom-2 right-2 p-2 bg-white/90 rounded-lg cursor-pointer hover:bg-white transition-colors shadow-sm">
                      <ImagePlus size={16} className="text-gray-600" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                    <ImagePlus size={32} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Subir imagen</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText size={20} className="text-gray-600" />
              <h2 className="text-lg font-medium text-gray-900">
                Descripción
              </h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción del producto
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe las características del producto..."
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors resize-none"
              />
            </div>
          </div>
        </form>
      </div>

      <MensajeConfirmacion
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="¿Deseas cancelar?"
        description={
          isEditMode 
            ? "Se perderán los cambios no guardados." 
            : "Se perderá la información ingresada."
        }
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}