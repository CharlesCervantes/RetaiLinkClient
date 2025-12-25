import { Table, Row } from "@tanstack/react-table";
import { ExportConfig } from "../types/datable";

// ============================================================================
// EXPORTACIÓN A EXCEL
// ============================================================================

/**
 * Exporta los datos de la tabla a un archivo Excel (.xlsx)
 * Usa la librería SheetJS (xlsx) que debe estar instalada
 */
export async function exportToExcel<TData>(
  table: Table<TData>,
  config: ExportConfig = {},
): Promise<void> {
  const {
    fileName = "export",
    sheetName = "Datos",
    columns,
    beforeExport,
    dateFormat = "DD/MM/YYYY",
  } = config;

  // Importar xlsx dinámicamente para evitar cargar si no se usa
  const XLSX = await import("xlsx");

  // Obtener las filas visibles o filtradas
  let rows = table.getFilteredRowModel().rows;

  // Obtener los datos originales
  let data = rows.map((row) => row.original);

  // Aplicar transformación si existe
  if (beforeExport) {
    data = await beforeExport(data);
  }

  // Obtener las columnas a exportar
  const visibleColumns = table.getAllColumns().filter((col) => {
    // Filtrar columnas de selección y acciones
    if (col.id === "select" || col.id === "actions") return false;
    // Si se especificaron columnas, filtrar por ellas
    if (columns && columns.length > 0) {
      return columns.includes(col.id);
    }
    // Por defecto, solo columnas visibles con accessor
    return col.getIsVisible() && col.accessorFn !== undefined;
  });

  // Crear headers
  const headers = visibleColumns.map((col) => {
    const headerDef = col.columnDef.header;
    if (typeof headerDef === "string") return headerDef;
    // Usar el ID de la columna como fallback
    return col.id;
  });

  // Crear filas de datos
  const exportData = data.map((row) => {
    const rowData: Record<string, unknown> = {};
    visibleColumns.forEach((col, index) => {
      const value = col.accessorFn ? col.accessorFn(row, index) : undefined;
      rowData[headers[index]] = formatValueForExcel(value, dateFormat);
    });
    return rowData;
  });

  // Crear workbook y worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Auto-ajustar ancho de columnas
  const maxWidth = 50;
  const colWidths = headers.map((header) => {
    const headerLength = header.length;
    const maxDataLength = Math.max(
      ...exportData.map((row) => {
        const value = row[header];
        return value ? String(value).length : 0;
      }),
    );
    return {
      wch: Math.min(Math.max(headerLength, maxDataLength) + 2, maxWidth),
    };
  });
  worksheet["!cols"] = colWidths;

  // Generar y descargar archivo
  const timestamp = new Date().toISOString().split("T")[0];
  XLSX.writeFile(workbook, `${fileName}_${timestamp}.xlsx`);
}

/**
 * Formatea un valor para Excel
 */
function formatValueForExcel(
  value: unknown,
  dateFormat: string,
): string | number | boolean | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value;
  if (value instanceof Date) {
    return formatDate(value, dateFormat);
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

/**
 * Formatea una fecha según el formato especificado
 */
function formatDate(date: Date, format: string): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return format
    .replace("DD", day)
    .replace("MM", month)
    .replace("YYYY", String(year))
    .replace("YY", String(year).slice(-2));
}

// ============================================================================
// UTILIDADES DE FILTRADO
// ============================================================================

/**
 * Función de filtro para texto (case-insensitive, parcial)
 */
export function textFilter<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: string,
): boolean {
  const value = row.getValue(columnId);
  if (value === null || value === undefined) return false;
  return String(value)
    .toLowerCase()
    .includes(String(filterValue).toLowerCase());
}

/**
 * Función de filtro para select (coincidencia exacta)
 */
export function selectFilter<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: string,
): boolean {
  const value = row.getValue(columnId);
  if (filterValue === "" || filterValue === undefined) return true;
  return String(value) === String(filterValue);
}

/**
 * Función de filtro para multiselect
 */
export function multiselectFilter<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: string[],
): boolean {
  if (!filterValue || filterValue.length === 0) return true;
  const value = row.getValue(columnId);
  return filterValue.includes(String(value));
}

/**
 * Función de filtro para rango de números
 */
export function numberRangeFilter<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: [number | null, number | null],
): boolean {
  const value = row.getValue(columnId) as number;
  const [min, max] = filterValue;
  if (min !== null && value < min) return false;
  if (max !== null && value > max) return false;
  return true;
}

/**
 * Función de filtro para rango de fechas
 */
export function dateRangeFilter<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: [Date | null, Date | null],
): boolean {
  const value = row.getValue(columnId);
  if (!value) return false;

  const date = value instanceof Date ? value : new Date(String(value));
  const [start, end] = filterValue;

  if (start && date < start) return false;
  if (end && date > end) return false;
  return true;
}

/**
 * Función de filtro para booleanos
 */
export function booleanFilter<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: boolean | null,
): boolean {
  if (filterValue === null) return true;
  const value = row.getValue(columnId);
  return Boolean(value) === filterValue;
}

// ============================================================================
// UTILIDADES GENERALES
// ============================================================================

/**
 * Debounce function para inputs
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Genera un ID único
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Obtiene el valor nested de un objeto usando dot notation
 */
export function getNestedValue<T>(obj: T, path: string): unknown {
  return path.split(".").reduce((acc: unknown, part: string) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

/**
 * Clona profundamente un objeto
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Compara dos valores para ordenamiento
 */
export function compareValues(a: unknown, b: unknown, desc: boolean): number {
  // Handle null/undefined
  if (a === null || a === undefined) return desc ? -1 : 1;
  if (b === null || b === undefined) return desc ? 1 : -1;

  // Handle dates
  if (a instanceof Date && b instanceof Date) {
    return desc ? b.getTime() - a.getTime() : a.getTime() - b.getTime();
  }

  // Handle numbers
  if (typeof a === "number" && typeof b === "number") {
    return desc ? b - a : a - b;
  }

  // Handle strings
  const strA = String(a).toLowerCase();
  const strB = String(b).toLowerCase();
  return desc ? strB.localeCompare(strA) : strA.localeCompare(strB);
}

// ============================================================================
// HELPERS PARA COLUMNAS
// ============================================================================

/**
 * Crea una columna de selección estándar
 */
export function createSelectColumn<
  TData,
>(): import("@tanstack/react-table").ColumnDef<TData> {
  return {
    id: "select",
    header: ({ table }) => {
      // Este componente se define en DataTable
      return null;
    },
    cell: ({ row }) => {
      // Este componente se define en DataTable
      return null;
    },
    enableSorting: false,
    enableHiding: false,
  };
}

/**
 * Crea una columna de acciones
 */
export function createActionsColumn<TData>(
  renderActions: (row: TData) => React.ReactNode,
): import("@tanstack/react-table").ColumnDef<TData> {
  return {
    id: "actions",
    header: "",
    cell: ({ row }) => renderActions(row.original),
    enableSorting: false,
    enableHiding: false,
  };
}
