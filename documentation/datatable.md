# DataTable Component

Componente de tabla de datos flexible, escalable y responsive basado en **shadcn/ui** y **TanStack Table**.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![React](https://img.shields.io/badge/React-18+-61DAFB)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Instalación](#-instalación)
- [Uso Básico](#-uso-básico)
- [Configuración de Columnas](#-configuración-de-columnas)
- [Paginación](#-paginación)
- [Filtros](#-filtros)
- [Exportación a Excel](#-exportación-a-excel)
- [Selección de Filas](#-selección-de-filas)
- [Modo Responsive Automático](#-modo-responsive-automático)
- [Props Completas](#-props-completas)
- [Personalización de la Interfaz](#-personalización-de-la-interfaz)
- [Estructura de Archivos](#-estructura-de-archivos)
- [Ejemplos](#-ejemplos)

---

## ✨ Características

- ✅ **Tipado fuerte con TypeScript** - Soporte completo de genéricos
- ✅ **Paginación configurable** - Client-side (default) o Server-side
- ✅ **Sistema de filtros flexible** - Texto, Select, Multiselect, Fecha, Rango, Numérico, Booleano
- ✅ **Ordenamiento** - Por columna con indicadores visuales
- ✅ **Selección de filas** - Individual o múltiple
- ✅ **Visibilidad de columnas** - Toggle para mostrar/ocultar
- ✅ **Exportación a Excel** - Genera archivos .xlsx
- ✅ **Columnas personalizables** - Define tu propia renderización
- ✅ **Responsive automático** - Detecta el espacio y colapsa columnas inteligentemente
- ✅ **Estados de carga y vacío** - Con skeletons y mensajes personalizables
- ✅ **Subtablas expandibles** - Para ver datos colapsados

---

## 📦 Instalación

### 1. Dependencias requeridas

```bash
# shadcn/ui components
npx shadcn@latest add table button input select dropdown-menu checkbox badge popover calendar command skeleton

# TanStack Table
npm install @tanstack/react-table

# Para exportación Excel
npm install xlsx

# Para filtros de fecha (opcional)
npm install date-fns
```

### 2. Copiar los componentes

Copia la carpeta `components/ui/data-table` a tu proyecto:

```
components/ui/data-table/
├── index.ts
├── types.ts
├── utils.ts
├── DataTable.tsx
├── DataTablePagination.tsx
├── DataTableFilters.tsx
├── DataTableColumnHeader.tsx
└── README.md
```

### 3. Verificar imports

Asegúrate de tener configurado el alias `@/` en tu `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 🚀 Uso Básico

```tsx
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

// 1. Define tu interfaz
interface Usuario {
  id: number;
  nombre: string;
  email: string;
  activo: boolean;
}

// 2. Define las columnas
const columns: ColumnDef<Usuario>[] = [
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "activo",
    header: "Estado",
    cell: ({ row }) => (row.original.activo ? "Activo" : "Inactivo"),
  },
];

// 3. Usa el componente
export default function UsuariosPage() {
  const data: Usuario[] = [
    { id: 1, nombre: "Juan", email: "juan@email.com", activo: true },
    { id: 2, nombre: "María", email: "maria@email.com", activo: false },
  ];

  return (
    <DataTable<Usuario>
      columns={columns}
      data={data}
      pagination={{ mode: "client", pageSize: 10 }}
    />
  );
}
```

---

## 📊 Configuración de Columnas

### Columna básica

```tsx
{
  accessorKey: "nombre",
  header: "Nombre",
}
```

### Columna con header sortable

```tsx
import { DataTableColumnHeader } from "@/components/ui/data-table";

{
  accessorKey: "nombre",
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Nombre" />
  ),
}
```

### Columna con celda personalizada

```tsx
{
  accessorKey: "precio",
  header: "Precio",
  cell: ({ row }) => {
    const precio = row.original.precio;
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(precio);
  },
}
```

### Columna de acciones

```tsx
import { MoreVertical, Eye, Edit2, Trash2 } from "lucide-react";

{
  id: "actions",
  header: "",
  cell: ({ row }) => {
    const item = row.original;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleView(item)}>
            <Eye className="mr-2 h-4 w-4" />
            Ver
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleEdit(item)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleDelete(item)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
  enableSorting: false,
  enableHiding: false,
}
```

---

## 📄 Paginación

### Client-Side (Default)

La paginación se maneja completamente en el frontend:

```tsx
<DataTable
  columns={columns}
  data={data}
  pagination={{
    mode: "client",
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    showPageSizeSelector: true,
    showSelectedCount: true,
    showPageNavigation: true,
  }}
/>
```

### Server-Side

Para grandes volúmenes de datos, la paginación se maneja en el backend:

```tsx
const [pageIndex, setPageIndex] = useState(0);
const [pageSize, setPageSize] = useState(10);
const [totalRows, setTotalRows] = useState(0);

// Fetch data cuando cambia la página
useEffect(() => {
  fetchData(pageIndex, pageSize).then((response) => {
    setData(response.data);
    setTotalRows(response.total);
  });
}, [pageIndex, pageSize]);

<DataTable
  columns={columns}
  data={data}
  pagination={{
    mode: "server",
    pageIndex: pageIndex,
    pageSize: pageSize,
    totalRows: totalRows,
    pageSizeOptions: [10, 20, 50],
    onPageChange: (newPageIndex, newPageSize) => {
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
    },
  }}
/>
```

---

## 🔍 Filtros

### Tipos de filtros disponibles

| Tipo | Descripción | Uso |
|------|-------------|-----|
| `text` | Input de búsqueda con debounce | Búsqueda de texto |
| `select` | Dropdown de selección única | Estados, categorías |
| `multiselect` | Selección múltiple con checkboxes | Tags, etiquetas |
| `date` | Selector de fecha | Fecha específica |
| `daterange` | Rango de fechas | Períodos |
| `number` | Input numérico | Cantidades, precios |
| `boolean` | Sí/No/Todos | Estados binarios |

### Configuración de filtros

```tsx
import { FilterConfig } from "@/components/ui/data-table";

const filtersConfig: FilterConfig[] = [
  {
    id: "nombre",  // Debe coincidir con accessorKey
    label: "Buscar",
    type: "text",
    placeholder: "Buscar por nombre...",
  },
  {
    id: "categoria",
    label: "Categoría",
    type: "select",
    placeholder: "Todas",
    options: [
      { label: "Electrónicos", value: "electronics" },
      { label: "Ropa", value: "clothing" },
      { label: "Hogar", value: "home" },
    ],
  },
  {
    id: "tags",
    label: "Etiquetas",
    type: "multiselect",
    options: [
      { label: "Nuevo", value: "new" },
      { label: "Oferta", value: "sale" },
      { label: "Popular", value: "popular" },
    ],
  },
  {
    id: "activo",
    label: "Estado",
    type: "boolean",
    options: [
      { label: "Activo", value: "true" },
      { label: "Inactivo", value: "false" },
    ],
  },
  {
    id: "fecha_registro",
    label: "Fecha",
    type: "daterange",
  },
];

<DataTable
  columns={columns}
  data={data}
  filters={{
    filters: filtersConfig,
    showClearButton: true,
    layout: "inline",  // "inline" | "stacked" | "grid"
    gridCols: 4,       // Solo para layout="grid"
    debounceMs: 300,
    onFiltersChange: (filters) => {
      console.log("Filtros activos:", filters);
    },
  }}
/>
```

---

## 📥 Exportación a Excel

```tsx
<DataTable
  columns={columns}
  data={data}
  export={{
    enableExcel: true,
    fileName: "reporte_usuarios",
    sheetName: "Usuarios",
    // Opcional: columnas específicas a exportar
    columns: ["nombre", "email", "fecha_registro"],
    // Opcional: formato de fecha
    dateFormat: "DD/MM/YYYY",
    // Opcional: transformar datos antes de exportar
    beforeExport: async (data) => {
      return data.map((item) => ({
        ...item,
        nombre: item.nombre.toUpperCase(),
      }));
    },
  }}
/>
```

**Nota:** La exportación usa la librería `xlsx`. Asegúrate de instalarla:

```bash
npm install xlsx
```

---

## ☑️ Selección de Filas

```tsx
<DataTable
  columns={columns}
  data={data}
  rowSelection={{
    enabled: true,
    mode: "multiple",  // "single" | "multiple"
    onSelectionChange: (selectedRows) => {
      console.log("Seleccionados:", selectedRows.map(r => r.original));
    },
    // Opcional: condición para poder seleccionar
    canSelectRow: (row) => row.original.activo === true,
  }}
/>
```

---

## 📱 Modo Responsive Automático

El DataTable detecta automáticamente si las columnas no caben en la pantalla y muestra un botón de expansión para ver las columnas ocultas.

### Configuración

```tsx
<DataTable
  columns={columns}
  data={data}
  responsive={{
    enabled: true,
    // Ancho mínimo por columna para calcular cuántas caben
    minColumnWidth: 150,  // default: 150px
    // Columnas prioritarias que siempre se muestran
    priorityColumns: ["nombre", "estado"],
  }}
/>
```

### Cómo funciona

1. **Mide el contenedor** automáticamente usando `ResizeObserver`
2. **Calcula** cuántas columnas caben según `minColumnWidth`
3. **Prioriza** las columnas listadas en `priorityColumns`
4. **Si no caben todas** → aparece el botón ➕ verde al final
5. **Al expandir** → muestra las columnas ocultas como subtabla

### Comportamiento visual

**Pantalla amplia - Todas las columnas visibles:**

| ☐ | Cliente | Contacto | Usuarios | Estado | ⋮ |
|---|---------|----------|----------|--------|---|

**Pantalla reducida - Columnas colapsadas:**

| ☐ | Cliente | Estado | ⋮ | ➕ |
|---|---------|--------|---|---|

**Al expandir (➕ → ➖) - Formato vertical:**

| ☐ | Cliente | Estado | ⋮ | ➖ |
|---|---------|--------|---|---|
|   | ┌─────────────────────────┐   |
|   | │ Contacto    │ email... │   |
|   | ├─────────────┼──────────┤   |
|   | │ Usuarios    │ 45       │   |
|   | ├─────────────┼──────────┤   |
|   | │ Fecha       │ 12/01/25 │   |
|   | └─────────────────────────┘   |

### Características

- ✅ **100% automático** - Se adapta al redimensionar la ventana
- ✅ **Sin breakpoints fijos** - Funciona en cualquier tamaño
- ✅ **Columnas prioritarias** - Define cuáles siempre deben verse
- ✅ **Formato vertical** - Sin scroll horizontal en la expansión
- ✅ **Tooltip en el botón** - "Ver más" / "Ver menos"

---

## 📋 Props Completas

### DataTableProps

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `columns` | `ColumnDef<TData>[]` | **requerido** | Definición de columnas |
| `data` | `TData[]` | **requerido** | Datos a mostrar |
| `pagination` | `PaginationConfig` | `undefined` | Configuración de paginación |
| `export` | `ExportConfig` | `undefined` | Configuración de exportación |
| `filters` | `FiltersConfig` | `undefined` | Configuración de filtros |
| `rowSelection` | `RowSelectionConfig` | `undefined` | Configuración de selección |
| `responsive` | `ResponsiveConfig` | `undefined` | Configuración responsive |
| `initialState` | `DataTableInitialState` | `undefined` | Estado inicial |
| `showColumnVisibility` | `boolean` | `true` | Mostrar toggle de columnas |
| `emptyMessage` | `string \| ReactNode` | `"No se encontraron resultados."` | Mensaje sin datos |
| `emptyIcon` | `ReactNode` | `undefined` | Ícono sin datos |
| `isLoading` | `boolean` | `false` | Estado de carga |
| `loadingComponent` | `ReactNode` | `undefined` | Componente de carga |
| `maxHeight` | `string \| number` | `undefined` | Altura máxima con scroll |
| `className` | `string` | `undefined` | Clase CSS del contenedor |
| `tableClassName` | `string` | `undefined` | Clase CSS de la tabla |
| `onStateChange` | `function` | `undefined` | Callback de cambio de estado |
| `getRowId` | `function` | `undefined` | Función para obtener ID de fila |
| `toolbarStart` | `ReactNode` | `undefined` | Contenido inicio del toolbar |
| `toolbarEnd` | `ReactNode` | `undefined` | Contenido final del toolbar |
| `footer` | `ReactNode` | `undefined` | Footer personalizado |

### PaginationConfig

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `mode` | `"client" \| "server"` | `"client"` | Modo de paginación |
| `pageSize` | `number` | `10` | Tamaño de página |
| `pageSizeOptions` | `number[]` | `[10,20,30,50,100]` | Opciones de tamaño |
| `totalRows` | `number` | - | Total (server-side) |
| `pageIndex` | `number` | `0` | Página actual (server-side) |
| `onPageChange` | `function` | - | Callback cambio de página |
| `showPageSizeSelector` | `boolean` | `true` | Mostrar selector de tamaño |
| `showSelectedCount` | `boolean` | `true` | Mostrar contador |
| `showPageNavigation` | `boolean` | `true` | Mostrar navegación |

### ResponsiveConfig

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `enabled` | `boolean` | `false` | Habilitar modo responsive |
| `minColumnWidth` | `number` | `150` | Ancho mínimo por columna (px) |
| `priorityColumns` | `string[]` | `[]` | Columnas siempre visibles |

### FilterConfig

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `id` | `string` | **requerido** | ID (= accessorKey) |
| `label` | `string` | **requerido** | Etiqueta del filtro |
| `type` | `FilterType` | **requerido** | Tipo de filtro |
| `placeholder` | `string` | - | Placeholder |
| `options` | `FilterOption[]` | - | Opciones (select/multiselect) |
| `defaultValue` | `unknown` | - | Valor por defecto |
| `className` | `string` | - | Clase CSS adicional |
| `min` | `number` | - | Mínimo (type="number") |
| `max` | `number` | - | Máximo (type="number") |

---

## 🎨 Personalización de la Interfaz

Esta sección te ayuda a personalizar el DataTable para crear tu propio fork o ajustarlo a tu diseño.

### Estructura de componentes

```
DataTable.tsx
├── ExpandButton          → Botón de expandir filas
├── ExpandedRowContent    → Subtabla expandida
├── DataTable             → Componente principal
│   ├── Toolbar           → Filtros + acciones
│   ├── Table             → Tabla principal
│   │   ├── TableHeader
│   │   └── TableBody
│   │       ├── Row
│   │       └── ExpandedRow
│   └── Pagination        → Paginación
```

### Personalizar el botón de expandir

El botón de expandir se encuentra en la función `ExpandButton`:

```tsx
// Ubicación: DataTable.tsx, línea ~80

function ExpandButton({ isExpanded, onClick }: ExpandButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-1.5 rounded-md transition-all",
        "hover:bg-emerald-50 active:scale-95",  // ← Cambiar color hover
        "group relative"
      )}
    >
      {isExpanded ? (
        <Minus className="w-5 h-5 text-emerald-600" />  // ← Color del icono
      ) : (
        <Plus className="w-5 h-5 text-emerald-600" />
      )}
      {/* Tooltip */}
      <span className="... bg-gray-900 ...">
        {isExpanded ? "Ver menos" : "Ver más"}  // ← Textos del tooltip
      </span>
    </button>
  );
}
```

**Ejemplos de personalización:**

```tsx
// Botón azul
className="hover:bg-blue-50"
<Plus className="text-blue-600" />

// Botón con fondo sólido
className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full w-8 h-8"

// Sin tooltip - eliminar el <span> del tooltip
```

### Personalizar la expansión vertical

La expansión se renderiza en `ExpandedRowContent` con formato vertical (label: valor):

```tsx
// Ubicación: DataTable.tsx, línea ~110

function ExpandedRowContent<TData>({ row, collapsedColumns }) {
  return (
    <div className="px-4 py-3 bg-muted/20">  {/* ← Fondo del contenedor */}
      <div className="rounded-md border overflow-hidden bg-background">  {/* ← Card */}
        <div className="divide-y">  {/* ← Separadores entre filas */}
          {collapsedColumns.map((column) => (
            <div className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50">
              {/* Label */}
              <span className="text-sm font-medium text-muted-foreground min-w-[120px]">
                {headerContent}
              </span>
              {/* Valor */}
              <div className="text-sm flex-1">
                {cellContent}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Ejemplos de personalización:**

```tsx
// Con borde lateral coloreado
<div className="border-l-4 border-primary rounded-md ...">

// Fondo más oscuro
<div className="bg-muted/40">

// Labels más anchos
<span className="min-w-[150px]">

// Sin hover en filas
className="flex items-center gap-4 px-4 py-3"  // quitar hover:bg-muted/50

// Estilo de lista con iconos
<div className="flex items-center gap-2">
  <ChevronRight className="w-4 h-4 text-muted-foreground" />
  <span>{headerContent}:</span>
  <span>{cellContent}</span>
</div>
```

### Personalizar la paginación

Edita `DataTablePagination.tsx`:

```tsx
// Textos en español (ya están configurados)
"Filas por página"
"Página {n} de {total}"
"{n} de {total} fila(s) seleccionada(s)"
"{n} registro(s) en total"

// Cambiar iconos de navegación
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
```

### Personalizar los filtros

Edita `DataTableFilters.tsx`:

```tsx
// Componentes de filtro individuales:
TextFilter       // Input con icono de búsqueda
SelectFilter     // Dropdown
MultiselectFilter // Multi-select con Command
DateFilter       // Calendar picker
DateRangeFilter  // Rango de fechas
NumberFilter     // Input numérico
BooleanFilter    // Select Sí/No/Todos

// Constante para "Todos" en selects (no usar string vacío)
const ALL_VALUE = "__all__";  // ← Cambiar si interfiere con tus datos
```

### Personalizar el estado vacío

```tsx
<DataTable
  ...
  emptyMessage="No hay clientes registrados"
  emptyIcon={<Users className="w-12 h-12 text-muted-foreground" />}
/>

// O con componente personalizado
emptyMessage={
  <div className="text-center py-8">
    <Ghost className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
    <h3 className="text-lg font-medium">Sin resultados</h3>
    <p className="text-sm text-muted-foreground">
      Intenta ajustar los filtros de búsqueda
    </p>
  </div>
}
```

### Personalizar el estado de carga

```tsx
<DataTable
  ...
  isLoading={isLoading}
  loadingComponent={
    <div className="flex items-center justify-center py-8">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <span className="ml-2">Cargando datos...</span>
    </div>
  }
/>
```

### Variables de color importantes

Si usas Tailwind, estos son los colores principales usados:

| Elemento | Clase | Descripción |
|----------|-------|-------------|
| Botón expandir icono | `text-emerald-600` | Color del ➕/➖ |
| Botón expandir hover | `hover:bg-emerald-50` | Fondo al pasar mouse |
| Header tabla | `bg-muted/50` | Fondo de headers |
| Fila hover | `hover:bg-muted/50` | Hover en filas |
| Expansión fondo | `bg-muted/20` | Fondo contenedor expandido |
| Expansión card | `bg-background` | Fondo de la card vertical |
| Expansión separador | `divide-y` | Líneas entre items |
| Expansión label | `text-muted-foreground` | Color del label |
| Skeleton | Componente de shadcn | Estado de carga |
| Borde tabla | `border` | Borde general |
| Tooltip fondo | `bg-gray-900` | Fondo del tooltip |

### Crear un tema personalizado

Puedes crear un wrapper con tus estilos:

```tsx
// components/ui/MyDataTable.tsx
import { DataTable, DataTableProps } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";

export function MyDataTable<TData, TValue>(
  props: DataTableProps<TData, TValue>
) {
  return (
    <div className="my-custom-theme">
      <DataTable
        {...props}
        className={cn("my-table-styles", props.className)}
        tableClassName={cn("my-inner-table", props.tableClassName)}
      />
    </div>
  );
}
```

### Cambiar idioma de textos

Los textos están hardcodeados en español. Para cambiarlos:

**DataTablePagination.tsx:**
```tsx
// Líneas a modificar:
"Filas por página" 
"Página {n} de {total}"
"fila(s) seleccionada(s)"
"registro(s) en total"
"Ir a primera página"
"Página anterior"
"Página siguiente"
"Ir a última página"
```

**DataTableFilters.tsx:**
```tsx
// Líneas a modificar:
"Todos"
"Limpiar"
"No se encontraron resultados."
"Limpiar filtros"
"Buscar..."
"Seleccionar..."
```

**DataTable.tsx:**
```tsx
// Líneas a modificar:
"Seleccionar todos"
"Seleccionar fila"
"Ver más detalles"
"Ocultar detalles"
"Ver más"
"Ver menos"
"Exportar Excel"
"Excel"
"Columnas"
"Mostrar columnas"
"No se encontraron resultados."
```

**DataTableColumnHeader.tsx:**
```tsx
// Líneas a modificar:
"Ascendente"
"Descendente"
"Ocultar columna"
```

---

## 📁 Estructura de Archivos

```
components/ui/data-table/
├── index.ts                    # Exports públicos
├── types.ts                    # Tipos e interfaces TypeScript
├── utils.ts                    # Utilidades (exportar Excel, filtros)
├── DataTable.tsx               # Componente principal
├── DataTablePagination.tsx     # Componente de paginación
├── DataTableFilters.tsx        # Componente de filtros
├── DataTableColumnHeader.tsx   # Header de columna con sorting
└── README.md                   # Esta documentación
```

---

## 💡 Ejemplos

### Ejemplo completo: Página de Clientes

```tsx
"use client";

import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Building2, Users, Eye, Edit2, Trash2, MoreVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DataTable,
  DataTableColumnHeader,
  FilterConfig,
} from "@/components/ui/data-table";

interface Cliente {
  id: number;
  nombre: string;
  email: string;
  usuarios: number;
  activo: boolean;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([
    { id: 1, nombre: "Empresa A", email: "a@email.com", usuarios: 10, activo: true },
    { id: 2, nombre: "Empresa B", email: "b@email.com", usuarios: 5, activo: false },
  ]);

  const columns = useMemo<ColumnDef<Cliente>[]>(() => [
    {
      accessorKey: "nombre",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Cliente" />,
    },
    {
      accessorKey: "email",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    },
    {
      accessorKey: "usuarios",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Usuarios" />,
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-md">
          <Users size={14} />
          {row.original.usuarios}
        </span>
      ),
    },
    {
      accessorKey: "activo",
      header: "Estado",
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-md text-sm ${
          row.original.activo 
            ? "bg-green-50 text-green-700" 
            : "bg-red-50 text-red-700"
        }`}>
          {row.original.activo ? "Activo" : "Inactivo"}
        </span>
      ),
      filterFn: (row, id, value) => {
        if (value === null) return true;
        return row.getValue(id) === (value === "true");
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />Ver</DropdownMenuItem>
            <DropdownMenuItem><Edit2 className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], []);

  const filters: FilterConfig[] = [
    { id: "nombre", label: "Buscar", type: "text", placeholder: "Buscar cliente..." },
    { 
      id: "activo", 
      label: "Estado", 
      type: "boolean",
      options: [
        { label: "Activo", value: "true" },
        { label: "Inactivo", value: "false" },
      ],
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Button><Plus className="mr-2 h-4 w-4" />Nuevo Cliente</Button>
      </div>
      
      <DataTable<Cliente>
        columns={columns}
        data={clientes}
        filters={{ filters, showClearButton: true, layout: "inline" }}
        pagination={{ mode: "client", pageSize: 10 }}
        export={{ enableExcel: true, fileName: "clientes" }}
        responsive={{ enabled: true, priorityColumns: ["nombre", "activo"] }}
        rowSelection={{ enabled: true, mode: "multiple" }}
        emptyMessage="No hay clientes"
        emptyIcon={<Building2 className="w-12 h-12 text-gray-300" />}
        getRowId={(row) => row.id.toString()}
      />
    </div>
  );
}
```

---

## 🐛 Solución de Problemas

### Error: "A Select.Item must have a value prop that is not an empty string"

Este error ocurre en Radix UI Select. La solución ya está implementada usando `ALL_VALUE = "__all__"` en lugar de string vacío.

### Las columnas no se colapsan en responsive

Verifica que:
1. `responsive.enabled` esté en `true`
2. El contenedor tenga un ancho definido
3. `minColumnWidth` sea apropiado para tu contenido

### La exportación a Excel no funciona

Asegúrate de tener instalado `xlsx`:
```bash
npm install xlsx
```

### Los filtros no afectan los datos

Verifica que el `id` del filtro coincida exactamente con el `accessorKey` de la columna.

---

## 🤝 Contribuir

Si encuentras un bug o tienes una mejora:

1. Fork del repositorio
2. Crea una rama (`git checkout -b feature/mejora`)
3. Commit de cambios (`git commit -m 'Agregar mejora'`)
4. Push a la rama (`git push origin feature/mejora`)
5. Abre un Pull Request

---

## 📄 Licencia

MIT License - Usa este componente libremente en tus proyectos.

---

**Hecho con ❤️ usando shadcn/ui y TanStack Table**
