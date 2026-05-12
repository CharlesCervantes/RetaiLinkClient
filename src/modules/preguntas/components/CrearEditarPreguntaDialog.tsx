import { toast } from "sonner"
import { useState, useEffect } from "react"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { useAuthStore } from "@/stores"
import { getCLientsList } from "@/Fetch/clientes"
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  ScrollArea,
} from "@/components"
import { api, ApiResponse } from "@/lib"

// ============================================================================
// SCHEMAS
// ============================================================================

const questionTypeEnum = z.enum(["open", "boolean", "numeric", "range", "evidence", "multiple"])

const numberOptional = () =>
    z.preprocess(
        (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
        z.number().optional()
    )
    const createQuestionOptionSchema = z.object({
    option_text: z.string().min(1, "El texto de la opción es requerido"),
    option_value_numeric: numberOptional(),
    option_value_text: z.string().optional(),
    option_order: z.preprocess(
        (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
        z.number().int().optional()
    ),
})

const formSchema = z.object({
  question: z.string().min(1, "La pregunta es requerida"),
  question_type: questionTypeEnum,
  min_value: numberOptional(),
  max_value: numberOptional(),
  max_photos: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number().int().optional()
  ),
  options: z.array(createQuestionOptionSchema).optional(),
  clients: z.array(z.number().int().positive()).optional(),
})

type FormValues = z.infer<typeof formSchema>

const QUESTION_TYPE_LABELS: Record<z.infer<typeof questionTypeEnum>, string> = {
  open: "Texto abierto",
  boolean: "Sí / No",
  numeric: "Numérico",
  range: "Rango",
  evidence: "Evidencia (foto)",
  multiple: "Opción múltiple",
}

// ============================================================================
// TYPES
// ============================================================================

interface Cliente {
  id_client: number
  name: string
}

interface CrearEditarPreguntaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  id_question: number | null
  onSuccess: () => void
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CrearEditarPreguntaDialog({ open, onOpenChange, id_question, onSuccess }: CrearEditarPreguntaDialogProps) {
  const { user } = useAuthStore()
  const isEditMode = !!id_question

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loadingClients, setLoadingClients] = useState(false)
  const [loadingSubmit, setLoadingSubmit] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      question: "",
      question_type: "open",
      min_value: undefined,
      max_value: undefined,
      max_photos: undefined,
      options: [],
      clients: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  })

  const watchType = form.watch("question_type")
  const watchClients = form.watch("clients") || []

  // Cargar clientes al abrir el dialog
  useEffect(() => {
    if (!open) return

    const fetchClients = async () => {
      try {
        setLoadingClients(true)
        const res = await getCLientsList()
        if (res?.data) {
          setClientes(
            res.data.map((c: { id_client: number; name: string }) => ({
              id_client: c.id_client,
              name: c.name,
            }))
          )
        }
      } catch (error) {
        console.error("Error cargando clientes:", error)
        toast.error("Error al cargar los clientes")
      } finally {
        setLoadingClients(false)
      }
    }

    fetchClients()
  }, [open])

  // Resetear form al abrir/cerrar
  useEffect(() => {
    if (open && !isEditMode) {
      form.reset({
        question: "",
        question_type: "open",
        min_value: undefined,
        max_value: undefined,
        max_photos: undefined,
        options: [],
        clients: [],
      })
    }
  }, [open, isEditMode, form])

  const showMinMax = watchType === "numeric" || watchType === "range"
  const showMaxPhotos = watchType === "evidence"
  const showOptions = watchType === "multiple" || watchType === "boolean"

  const toggleClient = (clientId: number) => {
    const current = form.getValues("clients") || []
    if (current.includes(clientId)) {
      form.setValue(
        "clients",
        current.filter((id) => id !== clientId)
      )
    } else {
      form.setValue("clients", [...current, clientId])
    }
  }

  const onSubmit = async (values: FormValues) => {
    try {
      setLoadingSubmit(true)

      const payload = {
        id_user: user?.id_user,
        question: values.question,
        question_type: values.question_type,
        min_value: values.min_value,
        max_value: values.max_value,
        max_photos: values.max_photos,
        options:
          values.options && values.options.length > 0
            ? values.options.map((opt, idx) => ({
                option_text: opt.option_text,
                option_value_numeric: opt.option_value_numeric,
                option_value_text: opt.option_value_text,
                option_order: opt.option_order ?? idx + 1,
              }))
            : [],
        clients: values.clients && values.clients.length > 0 ? values.clients : [],
      }

      console.log("Payload para crear pregunta:", payload)

      // TODO: Aquí iría la petición real
      // await api.post('/questions', payload);

      const fetch = await api.post<ApiResponse>(`/questions`, payload);
      console.log(fetch);


      toast.success(isEditMode ? "Pregunta actualizada" : "Pregunta creada exitosamente")
      onSuccess()
    } catch (error) {
      console.error("Error submit:", error)
      toast.error("Ocurrió un error")
    } finally {
      setLoadingSubmit(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Pregunta" : "Nueva Pregunta"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Modifica los datos de la pregunta"
              : "Ingresa los datos para crear una nueva pregunta"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-2">
            {/* Pregunta */}
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pregunta *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Escribe la pregunta..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo de pregunta */}
            <FormField
              control={form.control}
              name="question_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de pregunta *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(Object.keys(QUESTION_TYPE_LABELS) as Array<z.infer<typeof questionTypeEnum>>).map(
                        (type) => (
                          <SelectItem key={type} value={type}>
                            {QUESTION_TYPE_LABELS[type]}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campos condicionales: min / max */}
            {showMinMax && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="min_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor mínimo</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ej: 0"
                          name={field.name}
                          ref={field.ref}
                          onBlur={field.onBlur}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="max_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor máximo</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ej: 100"
                          name={field.name}
                          ref={field.ref}
                          onBlur={field.onBlur}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Campo condicional: max_photos */}
            {showMaxPhotos && (
              <FormField
                control={form.control}
                name="max_photos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Máximo de fotos permitidas</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ej: 5"
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Opciones (para multiple / boolean) */}
            {showOptions && (
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-base">Opciones</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        option_text: "",
                        option_value_numeric: undefined,
                        option_value_text: undefined,
                        option_order: fields.length + 1,
                      })
                    }
                  >
                    <Plus size={14} className="mr-1" />
                    Agregar opción
                  </Button>
                </div>

                {fields.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No hay opciones. Presiona "Agregar opción" para crear una.
                  </p>
                )}

                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <FormField
                        control={form.control}
                        name={`options.${index}.option_text`}
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Texto *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: Opción A" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-3">
                      <FormField
                        control={form.control}
                        name={`options.${index}.option_value_numeric`}
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Valor numérico</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Opcional"
                                name={field.name}
                                ref={field.ref}
                                onBlur={field.onBlur}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-3">
                      <FormField
                        control={form.control}
                        name={`options.${index}.option_value_text`}
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Valor texto</FormLabel>
                            <FormControl>
                              <Input placeholder="Opcional" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => remove(index)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Clientes asignados */}
            <div className="space-y-3 rounded-lg border p-4">
              <h4 className="text-sm font-medium">Clientes asignados</h4>
              <p className="text-sm text-gray-500">
                Selecciona los clientes a los que se asignará esta pregunta.
              </p>

              {loadingClients ? (
                <div className="flex items-center gap-2 py-2 text-sm text-gray-500">
                  <Loader2 size={16} className="animate-spin" />
                  Cargando clientes...
                </div>
              ) : clientes.length === 0 ? (
                <p className="text-sm text-gray-500">No hay clientes disponibles.</p>
              ) : (
                <ScrollArea className="h-40 rounded-md border p-2">
                  <div className="space-y-2">
                    {clientes.map((cliente) => {
                      const isChecked = watchClients.includes(cliente.id_client)
                      return (
                        <div
                          key={cliente.id_client}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`client-${cliente.id_client}`}
                            checked={isChecked}
                            onCheckedChange={() => toggleClient(cliente.id_client)}
                          />
                          <label
                            htmlFor={`client-${cliente.id_client}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {cliente.name}
                          </label>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loadingSubmit}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loadingSubmit}>
                {loadingSubmit && <Loader2 size={16} className="mr-2 animate-spin" />}
                {isEditMode ? "Guardar cambios" : "Crear pregunta"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
