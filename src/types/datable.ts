import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  PaginationState,
  Table,
  Row,
} from "@tanstack/react-table";
import { ReactNode } from "react";

// ============================================================================
// CONFIGURACIÓN DE PAGINACIÓN
// ============================================================================

export type PaginationMode = "client" | "server";

export interface PaginationConfig {
  /** Modo de paginación: 'client' (default) o 'server' */
  mode?: PaginationMode;
  /** Tamaño de página por defecto */
  pageSize?: number;
  /** Opciones de tamaño de página disponibles */
  pageSizeOptions?: number[];
  /** Total de registros (requerido para server-side) */
  totalRows?: number;
  /** Página actual (para server-side) */
  pageIndex?: number;
  /** Callback cuando cambia la página (server-side) */
  onPageChange?: (pageIndex: number, pageSize: number) => void;
  /** Mostrar selector de tamaño de página */
  showPageSizeSelector?: boolean;
  /** Mostrar información de filas seleccionadas */
  showSelectedCount?: boolean;
  /** Mostrar navegación de páginas */
  showPageNavigation?: boolean;
}

// ============================================================================
// CONFIGURACIÓN DE EXPORTACIÓN
// ============================================================================

export interface ExportConfig {
  /** Habilitar exportación a Excel */
  enableExcel?: boolean;
  /** Nombre del archivo sin extensión */
  fileName?: string;
  /** Nombre de la hoja de Excel */
  sheetName?: string;
  /** Columnas a exportar (por accessorKey), si no se especifica exporta todas */
  columns?: string[];
  /** Callback antes de exportar, permite modificar los datos */
  beforeExport?: <TData>(data: TData[]) => TData[] | Promise<TData[]>;
  /** Formato de fecha para la exportación */
  dateFormat?: string;
}

// ============================================================================
// CONFIGURACIÓN DE FILTROS
// ============================================================================

export type FilterType =
  | "text"
  | "select"
  | "multiselect"
  | "date"
  | "daterange"
  | "number"
  | "boolean";

export interface FilterOption {
  label: string;
  value: string;
  icon?: ReactNode;
}

export interface FilterConfig {
  /** ID único del filtro (debe coincidir con accessorKey de la columna) */
  id: string;
  /** Etiqueta del filtro */
  label: string;
  /** Tipo de filtro */
  type: FilterType;
  /** Placeholder del input */
  placeholder?: string;
  /** Opciones para select/multiselect */
  options?: FilterOption[];
  /** Valor por defecto */
  defaultValue?: unknown;
  /** Clase CSS adicional */
  className?: string;
  /** Si el filtro es de tipo numérico, min/max */
  min?: number;
  max?: number;
}

export interface FiltersConfig {
  /** Configuración de cada filtro */
  filters: FilterConfig[];
  /** Mostrar botón de limpiar filtros */
  showClearButton?: boolean;
  /** Layout de los filtros: 'inline' | 'stacked' | 'grid' */
  layout?: "inline" | "stacked" | "grid";
  /** Número de columnas para layout grid */
  gridCols?: number;
  /** Debounce en ms para inputs de texto */
  debounceMs?: number;
  /** Callback cuando cambian los filtros */
  onFiltersChange?: (filters: ColumnFiltersState) => void;
}

// ============================================================================
// CONFIGURACIÓN RESPONSIVE
// ============================================================================

export interface ResponsiveConfig {
  /** Habilitar modo responsive automático */
  enabled?: boolean;
  /**
   * Ancho mínimo estimado por columna en píxeles
   * Se usa para calcular cuántas columnas caben
   * Default: 150
   */
  minColumnWidth?: number;
  /**
   * IDs de columnas que siempre serán visibles (prioritarias)
   * Las columnas no listadas aquí se colapsarán si no caben
   * Por defecto: primera columna + acciones
   */
  priorityColumns?: string[];
}

// ============================================================================
// CONFIGURACIÓN DE SELECCIÓN DE FILAS
// ============================================================================

export interface RowSelectionConfig {
  /** Habilitar selección de filas */
  enabled?: boolean;
  /** Modo: 'single' | 'multiple' */
  mode?: "single" | "multiple";
  /** Callback cuando cambia la selección */
  onSelectionChange?: <TData>(selectedRows: Row<TData>[]) => void;
  /** Función para determinar si una fila puede ser seleccionada */
  canSelectRow?: <TData>(row: Row<TData>) => boolean;
}

// ============================================================================
// CONFIGURACIÓN DE COLUMNAS PERSONALIZADAS
// ============================================================================

export interface ActionColumnConfig<TData> {
  /** ID de la columna de acciones */
  id?: string;
  /** Header de la columna */
  header?: string | ReactNode;
  /** Renderizar celda de acciones */
  cell: (row: TData) => ReactNode;
  /** Ancho de la columna */
  width?: number;
}

// ============================================================================
// ESTADO INICIAL
// ============================================================================

export interface DataTableInitialState {
  sorting?: SortingState;
  columnFilters?: ColumnFiltersState;
  columnVisibility?: VisibilityState;
  pagination?: PaginationState;
  rowSelection?: Record<string, boolean>;
}

// ============================================================================
// PROPS PRINCIPALES DEL DATATABLE
// ============================================================================

export interface DataTableProps<TData, TValue = unknown> {
  /** Definición de columnas */
  columns: ColumnDef<TData, TValue>[];
  /** Datos a mostrar */
  data: TData[];
  /** Configuración de paginación */
  pagination?: PaginationConfig;
  /** Configuración de exportación */
  export?: ExportConfig;
  /** Configuración de filtros */
  filters?: FiltersConfig;
  /** Configuración de selección de filas */
  rowSelection?: RowSelectionConfig;
  /** Configuración responsive para móvil */
  responsive?: ResponsiveConfig;
  /** Estado inicial de la tabla */
  initialState?: DataTableInitialState;
  /** Mostrar toggle de visibilidad de columnas */
  showColumnVisibility?: boolean;
  /** Mensaje cuando no hay datos */
  emptyMessage?: string | ReactNode;
  /** Ícono cuando no hay datos */
  emptyIcon?: ReactNode;
  /** Estado de carga */
  isLoading?: boolean;
  /** Componente de carga personalizado */
  loadingComponent?: ReactNode;
  /** Altura máxima de la tabla (para scroll) */
  maxHeight?: string | number;
  /** Clase CSS adicional para el contenedor */
  className?: string;
  /** Clase CSS adicional para la tabla */
  tableClassName?: string;
  /** Callback cuando cambia el estado de la tabla */
  onStateChange?: (state: {
    sorting: SortingState;
    columnFilters: ColumnFiltersState;
    columnVisibility: VisibilityState;
    pagination: PaginationState;
    rowSelection: Record<string, boolean>;
  }) => void;
  /** Función para obtener el ID único de cada fila */
  getRowId?: (row: TData) => string;
  /** Renderizar toolbar personalizado arriba de la tabla */
  toolbarStart?: ReactNode;
  /** Renderizar toolbar personalizado al final */
  toolbarEnd?: ReactNode;
  /** Renderizar footer personalizado */
  footer?: ReactNode;
}

// ============================================================================
// PROPS DE COMPONENTES AUXILIARES
// ============================================================================

export interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  config?: PaginationConfig;
}

export interface DataTableFiltersProps {
  config: FiltersConfig;
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: (filters: ColumnFiltersState) => void;
}

export interface DataTableColumnHeaderProps<TData, TValue> {
  column: import("@tanstack/react-table").Column<TData, TValue>;
  title: string;
  className?: string;
}

export interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  filtersConfig?: FiltersConfig;
  exportConfig?: ExportConfig;
  showColumnVisibility?: boolean;
  toolbarStart?: ReactNode;
  toolbarEnd?: ReactNode;
}

// ============================================================================
// UTILIDADES DE TIPO
// ============================================================================

/** Helper para crear columnas tipadas */
export type TypedColumnDef<TData> = ColumnDef<TData, unknown>;

/** Helper para extraer el tipo de datos de las props */
export type ExtractDataType<T> =
  T extends DataTableProps<infer TData, unknown> ? TData : never;
