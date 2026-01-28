import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Checkbox } from "../../../components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select";

import { useAuthStore } from "../../../store/authStore";
import {
    createQuestion,
    updateQuestion,
    Question,
    CreateQuestionPayload,
    UpdateQuestionPayload,
    QuestionType,
    QUESTION_TYPE_LABELS,
    CreateOptionPayload,
} from "../../../Fetch/questions";

interface CrearEditarPreguntaDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pregunta: Question | null;
    onSuccess: () => void;
}

interface OptionFormData {
    option_text: string;
    option_value_numeric: string;
    option_value_text: string;
}

interface FormData {
    question: string;
    question_type: QuestionType;
    base_price: string;
    promoter_earns: string;
    i_status: boolean;
    // Type-specific fields
    is_multiple: boolean;       // For 'options' type
    min_value: string;          // For 'numeric' type
    max_value: string;          // For 'numeric' type
    max_photos: string;         // For 'photo' type
    options: OptionFormData[];  // For 'options' type
}

interface FormErrors {
    question?: string;
    question_type?: string;
    base_price?: string;
    promoter_earns?: string;
    min_value?: string;
    max_value?: string;
    max_photos?: string;
    options?: string;
}

const initialFormData: FormData = {
    question: "",
    question_type: "open",
    base_price: "",
    promoter_earns: "",
    i_status: true,
    is_multiple: false,
    min_value: "",
    max_value: "",
    max_photos: "1",
    options: [],
};

const createEmptyOption = (): OptionFormData => ({
    option_text: "",
    option_value_numeric: "",
    option_value_text: "",
});

export function CrearEditarPreguntaDialog({
    open,
    onOpenChange,
    pregunta,
    onSuccess,
}: CrearEditarPreguntaDialogProps) {
    const { user } = useAuthStore();
    const isEditMode = !!pregunta;

    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);

    // Cargar datos cuando se abre en modo edicion
    useEffect(() => {
        if (open && pregunta) {
            setFormData({
                question: pregunta.question,
                question_type: pregunta.question_type || "open",
                base_price: pregunta.base_price.toString(),
                promoter_earns: pregunta.promoter_earns.toString(),
                i_status: pregunta.i_status,
                is_multiple: pregunta.is_multiple || false,
                min_value: pregunta.min_value?.toString() || "",
                max_value: pregunta.max_value?.toString() || "",
                max_photos: pregunta.max_photos?.toString() || "1",
                options: pregunta.options?.map(opt => ({
                    option_text: opt.option_text,
                    option_value_numeric: opt.option_value_numeric?.toString() || "",
                    option_value_text: opt.option_value_text || "",
                })) || [],
            });
        } else if (open && !pregunta) {
            setFormData(initialFormData);
        }
        setErrors({});
    }, [open, pregunta]);

    const validate = (): boolean => {
        const newErrors: FormErrors = {};

        // Validar pregunta (minimo 10 caracteres)
        if (!formData.question.trim()) {
            newErrors.question = "La pregunta es requerida";
        } else if (formData.question.trim().length < 10) {
            newErrors.question = "La pregunta debe tener al menos 10 caracteres";
        }

        // Validar precio base
        const basePrice = parseFloat(formData.base_price);
        if (!formData.base_price) {
            newErrors.base_price = "El precio base es requerido";
        } else if (isNaN(basePrice) || basePrice < 0) {
            newErrors.base_price = "El precio debe ser un numero mayor o igual a 0";
        }

        // Validar ganancia promotor
        const promoterEarns = parseFloat(formData.promoter_earns);
        if (!formData.promoter_earns) {
            newErrors.promoter_earns = "La ganancia del promotor es requerida";
        } else if (isNaN(promoterEarns) || promoterEarns < 0) {
            newErrors.promoter_earns = "La ganancia debe ser un numero mayor o igual a 0";
        } else if (promoterEarns > basePrice) {
            newErrors.promoter_earns = "La ganancia no puede ser mayor al precio base";
        }

        // Validaciones especificas por tipo
        if (formData.question_type === "options") {
            if (formData.options.length < 2) {
                newErrors.options = "Debes agregar al menos 2 opciones";
            } else {
                const emptyOptions = formData.options.filter(opt => !opt.option_text.trim());
                if (emptyOptions.length > 0) {
                    newErrors.options = "Todas las opciones deben tener texto";
                }
            }
        }

        if (formData.question_type === "numeric") {
            const min = formData.min_value ? parseFloat(formData.min_value) : null;
            const max = formData.max_value ? parseFloat(formData.max_value) : null;

            if (min !== null && isNaN(min)) {
                newErrors.min_value = "El valor minimo debe ser un numero valido";
            }
            if (max !== null && isNaN(max)) {
                newErrors.max_value = "El valor maximo debe ser un numero valido";
            }
            if (min !== null && max !== null && !isNaN(min) && !isNaN(max) && min > max) {
                newErrors.min_value = "El valor minimo no puede ser mayor al maximo";
            }
        }

        if (formData.question_type === "photo") {
            const maxPhotos = parseInt(formData.max_photos);
            if (isNaN(maxPhotos) || maxPhotos < 1) {
                newErrors.max_photos = "Debes permitir al menos 1 foto";
            } else if (maxPhotos > 10) {
                newErrors.max_photos = "El maximo de fotos permitidas es 10";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Build options payload for 'options' type
    const buildOptionsPayload = (): CreateOptionPayload[] => {
        return formData.options.map((opt, index) => ({
            option_text: opt.option_text.trim(),
            option_value_numeric: opt.option_value_numeric ? parseFloat(opt.option_value_numeric) : undefined,
            option_value_text: opt.option_value_text.trim() || undefined,
            option_order: index + 1,
        }));
    };

    const handleSubmit = async () => {
        if (!validate() || !user) return;

        setLoading(true);

        try {
            if (isEditMode && pregunta) {
                // Actualizar
                const payload: UpdateQuestionPayload = {
                    id_user: user.id_user,
                    question: formData.question.trim(),
                    question_type: formData.question_type,
                    base_price: parseFloat(formData.base_price),
                    promoter_earns: parseFloat(formData.promoter_earns),
                    i_status: formData.i_status,
                };

                // Add type-specific fields
                if (formData.question_type === "options") {
                    payload.is_multiple = formData.is_multiple;
                    payload.options = buildOptionsPayload();
                } else if (formData.question_type === "numeric") {
                    payload.min_value = formData.min_value ? parseFloat(formData.min_value) : undefined;
                    payload.max_value = formData.max_value ? parseFloat(formData.max_value) : undefined;
                } else if (formData.question_type === "photo") {
                    payload.max_photos = parseInt(formData.max_photos);
                }

                const result = await updateQuestion(pregunta.id_question, payload);

                if (result.ok) {
                    toast.success("Pregunta actualizada correctamente");
                    onSuccess();
                } else {
                    toast.error(result.message || "Error al actualizar la pregunta");
                }
            } else {
                // Crear
                const payload: CreateQuestionPayload = {
                    id_user: user.id_user,
                    question: formData.question.trim(),
                    question_type: formData.question_type,
                    base_price: parseFloat(formData.base_price),
                    promoter_earns: parseFloat(formData.promoter_earns),
                    i_status: formData.i_status,
                };

                // Add type-specific fields
                if (formData.question_type === "options") {
                    payload.is_multiple = formData.is_multiple;
                    payload.options = buildOptionsPayload();
                } else if (formData.question_type === "numeric") {
                    payload.min_value = formData.min_value ? parseFloat(formData.min_value) : undefined;
                    payload.max_value = formData.max_value ? parseFloat(formData.max_value) : undefined;
                } else if (formData.question_type === "photo") {
                    payload.max_photos = parseInt(formData.max_photos);
                }

                const result = await createQuestion(payload);

                if (result.ok) {
                    toast.success("Pregunta creada correctamente");
                    onSuccess();
                } else {
                    toast.error(result.message || "Error al crear la pregunta");
                }
            }
        } catch (error) {
            console.error("Error guardando pregunta:", error);
            toast.error("Error al guardar la pregunta");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof FormData, value: string | boolean | OptionFormData[]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    // Option management functions
    const handleAddOption = () => {
        setFormData((prev) => ({
            ...prev,
            options: [...prev.options, createEmptyOption()],
        }));
        if (errors.options) {
            setErrors((prev) => ({ ...prev, options: undefined }));
        }
    };

    const handleRemoveOption = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index),
        }));
    };

    const handleOptionChange = (index: number, field: keyof OptionFormData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            options: prev.options.map((opt, i) =>
                i === index ? { ...opt, [field]: value } : opt
            ),
        }));
        if (errors.options) {
            setErrors((prev) => ({ ...prev, options: undefined }));
        }
    };

    const moveOption = (index: number, direction: "up" | "down") => {
        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= formData.options.length) return;

        setFormData((prev) => {
            const newOptions = [...prev.options];
            [newOptions[index], newOptions[newIndex]] = [newOptions[newIndex], newOptions[index]];
            return { ...prev, options: newOptions };
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? "Editar Pregunta" : "Nueva Pregunta"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? "Modifica los datos de la pregunta"
                            : "Ingresa los datos para crear una nueva pregunta"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Pregunta */}
                    <div className="space-y-2">
                        <Label htmlFor="question">
                            Pregunta <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="question"
                            placeholder="Escribe la pregunta..."
                            value={formData.question}
                            onChange={(e) => handleChange("question", e.target.value)}
                            className={errors.question ? "border-red-500" : ""}
                            rows={3}
                        />
                        {errors.question && (
                            <p className="text-sm text-red-500">{errors.question}</p>
                        )}
                        <p className="text-xs text-gray-500">
                            {formData.question.length} / minimo 10 caracteres
                        </p>
                    </div>

                    {/* Tipo de Pregunta */}
                    <div className="space-y-2">
                        <Label htmlFor="question_type">
                            Tipo de Respuesta <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={formData.question_type}
                            onValueChange={(value: QuestionType) => {
                                handleChange("question_type", value);
                                // Reset options when switching to 'options' type
                                if (value === "options" && formData.options.length === 0) {
                                    setFormData((prev) => ({
                                        ...prev,
                                        question_type: value,
                                        options: [createEmptyOption(), createEmptyOption()],
                                    }));
                                }
                            }}
                        >
                            <SelectTrigger className={errors.question_type ? "border-red-500" : ""}>
                                <SelectValue placeholder="Selecciona el tipo de respuesta" />
                            </SelectTrigger>
                            <SelectContent>
                                {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {QUESTION_TYPE_LABELS[type]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                            Define como el promotor respondera esta pregunta
                        </p>
                    </div>

                    {/* Type-specific fields */}
                    {/* Options type */}
                    {formData.question_type === "options" && (
                        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <Label>Opciones de Respuesta</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddOption}
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Agregar
                                </Button>
                            </div>

                            {/* Multiple selection checkbox */}
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="is_multiple"
                                    checked={formData.is_multiple}
                                    onCheckedChange={(checked) => handleChange("is_multiple", !!checked)}
                                />
                                <Label htmlFor="is_multiple" className="text-sm font-normal">
                                    Permitir seleccion multiple
                                </Label>
                            </div>

                            {/* Options list */}
                            <div className="space-y-2">
                                {formData.options.map((option, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                                        <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                                        <div className="flex-1 grid grid-cols-3 gap-2">
                                            <Input
                                                placeholder="Texto de la opcion"
                                                value={option.option_text}
                                                onChange={(e) => handleOptionChange(index, "option_text", e.target.value)}
                                                className="col-span-2"
                                            />
                                            <Input
                                                placeholder="Valor (opc)"
                                                value={option.option_value_text || option.option_value_numeric}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    // Try to parse as number, otherwise use as text
                                                    if (!isNaN(parseFloat(val)) && val.trim() !== "") {
                                                        handleOptionChange(index, "option_value_numeric", val);
                                                        handleOptionChange(index, "option_value_text", "");
                                                    } else {
                                                        handleOptionChange(index, "option_value_text", val);
                                                        handleOptionChange(index, "option_value_numeric", "");
                                                    }
                                                }}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveOption(index)}
                                            disabled={formData.options.length <= 2}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            {errors.options && (
                                <p className="text-sm text-red-500">{errors.options}</p>
                            )}
                            <p className="text-xs text-gray-500">
                                Minimo 2 opciones. El valor es opcional y puede ser numerico o texto.
                            </p>
                        </div>
                    )}

                    {/* Numeric type */}
                    {formData.question_type === "numeric" && (
                        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                            <Label>Rango de Valores (opcional)</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="min_value" className="text-xs">Minimo</Label>
                                    <Input
                                        id="min_value"
                                        type="number"
                                        placeholder="Sin minimo"
                                        value={formData.min_value}
                                        onChange={(e) => handleChange("min_value", e.target.value)}
                                        className={errors.min_value ? "border-red-500" : ""}
                                    />
                                    {errors.min_value && (
                                        <p className="text-xs text-red-500">{errors.min_value}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="max_value" className="text-xs">Maximo</Label>
                                    <Input
                                        id="max_value"
                                        type="number"
                                        placeholder="Sin maximo"
                                        value={formData.max_value}
                                        onChange={(e) => handleChange("max_value", e.target.value)}
                                        className={errors.max_value ? "border-red-500" : ""}
                                    />
                                    {errors.max_value && (
                                        <p className="text-xs text-red-500">{errors.max_value}</p>
                                    )}
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">
                                Deja vacio para no limitar el rango de valores numericos.
                            </p>
                        </div>
                    )}

                    {/* Photo type */}
                    {formData.question_type === "photo" && (
                        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                            <Label htmlFor="max_photos">Numero maximo de fotos</Label>
                            <Input
                                id="max_photos"
                                type="number"
                                min="1"
                                max="10"
                                value={formData.max_photos}
                                onChange={(e) => handleChange("max_photos", e.target.value)}
                                className={errors.max_photos ? "border-red-500" : ""}
                            />
                            {errors.max_photos && (
                                <p className="text-sm text-red-500">{errors.max_photos}</p>
                            )}
                            <p className="text-xs text-gray-500">
                                Maximo 10 fotos por pregunta.
                            </p>
                        </div>
                    )}

                    {/* Yes/No, Date, Open types don't need additional config */}
                    {formData.question_type === "yes_no" && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-700">
                                El promotor podra responder "Si" o "No" a esta pregunta.
                            </p>
                        </div>
                    )}

                    {formData.question_type === "date" && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-700">
                                El promotor podra seleccionar una fecha como respuesta.
                            </p>
                        </div>
                    )}

                    {formData.question_type === "open" && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-700">
                                El promotor podra escribir una respuesta de texto libre.
                            </p>
                        </div>
                    )}

                    {/* Pricing section */}
                    <div className="border-t pt-4 mt-4">
                        <h4 className="font-medium mb-3">Precios</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Precio Base */}
                            <div className="space-y-2">
                                <Label htmlFor="base_price">
                                    Precio Base (MXN) <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                        $
                                    </span>
                                    <Input
                                        id="base_price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.base_price}
                                        onChange={(e) => handleChange("base_price", e.target.value)}
                                        className={`pl-7 ${errors.base_price ? "border-red-500" : ""}`}
                                    />
                                </div>
                                {errors.base_price && (
                                    <p className="text-sm text-red-500">{errors.base_price}</p>
                                )}
                            </div>

                            {/* Ganancia Promotor */}
                            <div className="space-y-2">
                                <Label htmlFor="promoter_earns">
                                    Ganancia Promotor <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                        $
                                    </span>
                                    <Input
                                        id="promoter_earns"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.promoter_earns}
                                        onChange={(e) => handleChange("promoter_earns", e.target.value)}
                                        className={`pl-7 ${errors.promoter_earns ? "border-red-500" : ""}`}
                                    />
                                </div>
                                {errors.promoter_earns && (
                                    <p className="text-sm text-red-500">{errors.promoter_earns}</p>
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            La ganancia del promotor debe ser menor o igual al precio base.
                        </p>
                    </div>

                    {/* Estado */}
                    <div className="flex items-center gap-3 border-t pt-4">
                        <Checkbox
                            id="i_status"
                            checked={formData.i_status}
                            onCheckedChange={(checked) => handleChange("i_status", !!checked)}
                        />
                        <div className="space-y-0.5">
                            <Label htmlFor="i_status">Activo</Label>
                            <p className="text-xs text-gray-500">
                                Las preguntas inactivas no se muestran a los clientes
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditMode ? "Guardar cambios" : "Crear pregunta"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
