// Componente principal
export { DataTable } from "./ui/datatble";

// Componentes auxiliares
export { DataTablePagination } from "./ui/datatable-pagination";
export { DataTableFilters } from "./ui/datatable-filters";
export {
  DataTableColumnHeader,
  DataTableSortableHeader,
} from "./ui/datatable-columnheader";

// Utilidades
export {
  exportToExcel,
  textFilter,
  selectFilter,
  multiselectFilter,
  numberRangeFilter,
  dateRangeFilter,
  booleanFilter,
  debounce,
  createSelectColumn,
  createActionsColumn,
} from "../utils/datatable";

// Tipos
export type {
  // Configuraciones principales
  DataTableProps,
  PaginationConfig,
  PaginationMode,
  ExportConfig,
  FiltersConfig,
  FilterConfig,
  FilterType,
  FilterOption,
  RowSelectionConfig,
  ActionColumnConfig,
  DataTableInitialState,
  // Props de componentes
  DataTablePaginationProps,
  DataTableFiltersProps,
  DataTableColumnHeaderProps,
  DataTableToolbarProps,
  // Utilidades de tipo
  TypedColumnDef,
  ExtractDataType,
} from "../types/datable";
