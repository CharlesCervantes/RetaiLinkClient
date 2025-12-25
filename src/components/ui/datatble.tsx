"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  useReactTable,
  PaginationState,
  RowSelectionState,
  ExpandedState,
  Row,
} from "@tanstack/react-table";
import { Download, Settings2, Plus, Minus } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Skeleton } from "./skeleton";

import { DataTableProps } from "../../types/datable";
import { DataTablePagination } from "./datatable-pagination";
import { DataTableFilters } from "./datatable-filters";
import { exportToExcel } from "../../utils/datatable";

// ============================================================================
// HOOK PARA MEDIR ANCHO DEL CONTENEDOR
// ============================================================================

function useContainerWidth(ref: React.RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = React.useState(0);

  React.useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;

    // Set initial width
    setWidth(element.offsetWidth);

    // Observe resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [ref]);

  return width;
}

// ============================================================================
// BOTÓN DE EXPANDIR (Icono verde)
// ============================================================================

interface ExpandButtonProps {
  isExpanded: boolean;
  onClick: (e: React.MouseEvent) => void;
}

function ExpandButton({ isExpanded, onClick }: ExpandButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-1.5 rounded-md transition-all",
        "hover:bg-emerald-50 active:scale-95",
        "group relative",
      )}
    >
      {isExpanded ? (
        <Minus className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
      ) : (
        <Plus className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
      )}
      {/* Tooltip */}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {isExpanded ? "Ver menos" : "Ver más"}
      </span>
    </button>
  );
}

// ============================================================================
// COMPONENTE DE FILA EXPANDIDA (subtabla con mismo estilo)
// ============================================================================

interface ExpandedRowContentProps<TData> {
  row: Row<TData>;
  collapsedColumns: ColumnDef<TData, unknown>[];
}

function ExpandedRowContent<TData>({
  row,
  collapsedColumns,
}: ExpandedRowContentProps<TData>) {
  return (
    <div className="px-4 py-3 bg-muted/20">
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {collapsedColumns.map((column) => {
                const columnId =
                  column.id || (column as { accessorKey?: string }).accessorKey;
                if (!columnId) return null;

                // Obtener el header
                let headerContent: React.ReactNode = columnId;
                if (typeof column.header === "string") {
                  headerContent = column.header;
                }

                return (
                  <TableHead key={columnId} className="bg-muted/50 h-9 text-xs">
                    {headerContent}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="hover:bg-muted/50">
              {collapsedColumns.map((column) => {
                const columnId =
                  column.id || (column as { accessorKey?: string }).accessorKey;
                if (!columnId) return null;

                // Renderizar la celda manualmente
                const cellDef = column.cell;
                let cellContent: React.ReactNode;

                if (typeof cellDef === "function") {
                  try {
                    cellContent = cellDef({
                      row,
                      column: { id: columnId } as any,
                      getValue: () => row.getValue(columnId),
                      renderValue: () => row.getValue(columnId),
                      cell: {} as any,
                      table: {} as any,
                    } as any);
                  } catch {
                    cellContent = row.getValue(columnId) as React.ReactNode;
                  }
                } else {
                  cellContent = row.getValue(columnId) as React.ReactNode;
                }

                return (
                  <TableCell key={columnId} className="py-3">
                    {cellContent}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL DATATABLE
// ============================================================================

export function DataTable<TData, TValue = unknown>({
  columns: propColumns,
  data,
  pagination: paginationConfig,
  export: exportConfig,
  filters: filtersConfig,
  rowSelection: rowSelectionConfig,
  responsive: responsiveConfig,
  initialState,
  showColumnVisibility = true,
  emptyMessage = "No se encontraron resultados.",
  emptyIcon,
  isLoading = false,
  loadingComponent,
  maxHeight,
  className,
  tableClassName,
  onStateChange,
  getRowId,
  toolbarStart,
  toolbarEnd,
  footer,
}: DataTableProps<TData, TValue>) {
  // ============================================================================
  // REFS Y MEDICIÓN
  // ============================================================================

  const containerRef = React.useRef<HTMLDivElement>(null);
  const containerWidth = useContainerWidth(containerRef);

  // ============================================================================
  // RESPONSIVE CONFIG
  // ============================================================================

  const {
    enabled: responsiveEnabled = false,
    minColumnWidth = 150,
    priorityColumns: priorityColumnsProp = [],
  } = responsiveConfig || {};

  // ============================================================================
  // ESTADO
  // ============================================================================

  const [sorting, setSorting] = React.useState<SortingState>(
    initialState?.sorting || [],
  );
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    initialState?.columnFilters || [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(initialState?.columnVisibility || {});
  const [rowSelectionState, setRowSelectionState] =
    React.useState<RowSelectionState>(initialState?.rowSelection || {});
  const [paginationState, setPaginationState] = React.useState<PaginationState>(
    initialState?.pagination || {
      pageIndex: paginationConfig?.pageIndex || 0,
      pageSize: paginationConfig?.pageSize || 10,
    },
  );
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  // ============================================================================
  // CALCULAR COLUMNAS QUE CABEN
  // ============================================================================

  const { visibleColumnDefs, collapsedColumnDefs, needsCollapsing } =
    React.useMemo(() => {
      if (!responsiveEnabled || containerWidth === 0) {
        return {
          visibleColumnDefs: propColumns,
          collapsedColumnDefs: [] as ColumnDef<TData, TValue>[],
          needsCollapsing: false,
        };
      }

      // Calcular cuántas columnas caben
      // Reservar espacio para: select (40px), expand button (60px), actions (60px)
      const reservedWidth = 160;
      const availableWidth = containerWidth - reservedWidth;
      const maxVisibleColumns = Math.max(
        1,
        Math.floor(availableWidth / minColumnWidth),
      );

      // Determinar columnas prioritarias
      let priorityIds = [...priorityColumnsProp];

      // Si no se especificaron, usar la primera columna
      if (priorityIds.length === 0 && propColumns.length > 0) {
        const firstCol = propColumns[0];
        const firstColId =
          firstCol?.id || (firstCol as { accessorKey?: string })?.accessorKey;
        if (firstColId) {
          priorityIds = [firstColId];
        }
      }

      // Columnas especiales siempre son prioritarias
      const specialCols = ["select", "actions"];

      // Separar columnas normales de especiales
      const normalColumns: ColumnDef<TData, TValue>[] = [];
      const specialColumns: ColumnDef<TData, TValue>[] = [];

      propColumns.forEach((col) => {
        const colId = col.id || (col as { accessorKey?: string }).accessorKey;
        if (colId && specialCols.includes(colId)) {
          specialColumns.push(col);
        } else {
          normalColumns.push(col);
        }
      });

      // Si todas las columnas normales caben, no colapsar
      if (normalColumns.length <= maxVisibleColumns) {
        return {
          visibleColumnDefs: propColumns,
          collapsedColumnDefs: [] as ColumnDef<TData, TValue>[],
          needsCollapsing: false,
        };
      }

      // Ordenar columnas normales: prioritarias primero, luego el resto
      const sortedNormalColumns = [...normalColumns].sort((a, b) => {
        const aId = a.id || (a as { accessorKey?: string }).accessorKey || "";
        const bId = b.id || (b as { accessorKey?: string }).accessorKey || "";
        const aIsPriority = priorityIds.includes(aId);
        const bIsPriority = priorityIds.includes(bId);

        if (aIsPriority && !bIsPriority) return -1;
        if (!aIsPriority && bIsPriority) return 1;
        return 0;
      });

      // Tomar las primeras N columnas como visibles
      const visible = sortedNormalColumns.slice(0, maxVisibleColumns);
      const collapsed = sortedNormalColumns.slice(maxVisibleColumns);

      return {
        visibleColumnDefs: [...visible, ...specialColumns],
        collapsedColumnDefs: collapsed,
        needsCollapsing: collapsed.length > 0,
      };
    }, [
      propColumns,
      containerWidth,
      responsiveEnabled,
      minColumnWidth,
      priorityColumnsProp,
    ]);

  // ============================================================================
  // CONSTRUIR COLUMNAS FINALES
  // ============================================================================

  const columns = React.useMemo(() => {
    const cols: ColumnDef<TData, TValue>[] = [];

    // Agregar columna de selección si está habilitada
    if (rowSelectionConfig?.enabled) {
      cols.push({
        id: "select",
        header: ({ table }) =>
          rowSelectionConfig.mode === "multiple" ? (
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Seleccionar todos"
            />
          ) : null,
        cell: ({ row }) => {
          const canSelect = rowSelectionConfig.canSelectRow
            ? rowSelectionConfig.canSelectRow(row)
            : true;
          return (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              disabled={!canSelect}
              aria-label="Seleccionar fila"
            />
          );
        },
        enableSorting: false,
        enableHiding: false,
      } as ColumnDef<TData, TValue>);
    }

    // Agregar columnas visibles (excluyendo select y actions que manejamos aparte)
    visibleColumnDefs.forEach((col) => {
      const colId = col.id || (col as { accessorKey?: string }).accessorKey;
      if (colId !== "select" && colId !== "actions") {
        cols.push(col);
      }
    });

    // Agregar columna de acciones si existe
    const actionsCol = visibleColumnDefs.find((col) => col.id === "actions");
    if (actionsCol) {
      cols.push(actionsCol);
    }

    // Si hay columnas colapsadas, agregar columna de expansión AL FINAL
    if (needsCollapsing) {
      const expandColumn: ColumnDef<TData, TValue> = {
        id: "expand",
        header: () => null,
        cell: ({ row }) => {
          const isExpanded = row.getIsExpanded();
          return (
            <ExpandButton
              isExpanded={isExpanded}
              onClick={(e) => {
                e.stopPropagation();
                row.toggleExpanded();
              }}
            />
          );
        },
        enableSorting: false,
        enableHiding: false,
      };
      cols.push(expandColumn);
    }

    return cols;
  }, [visibleColumnDefs, needsCollapsing, rowSelectionConfig]);

  // ============================================================================
  // CONFIGURAR TABLA
  // ============================================================================

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection: rowSelectionState,
      pagination: paginationState,
      expanded,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelectionState,
    onPaginationChange: setPaginationState,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel:
      paginationConfig?.mode !== "server" ? getPaginationRowModel() : undefined,
    manualPagination: paginationConfig?.mode === "server",
    pageCount:
      paginationConfig?.mode === "server" && paginationConfig.totalRows
        ? Math.ceil(paginationConfig.totalRows / paginationState.pageSize)
        : undefined,
    getRowId: getRowId,
    enableRowSelection: rowSelectionConfig?.enabled,
    getRowCanExpand: () => needsCollapsing,
  });

  // ============================================================================
  // EFECTOS
  // ============================================================================

  // Notificar cambios de estado
  React.useEffect(() => {
    onStateChange?.({
      sorting,
      columnFilters,
      columnVisibility,
      pagination: paginationState,
      rowSelection: rowSelectionState,
    });
  }, [
    sorting,
    columnFilters,
    columnVisibility,
    paginationState,
    rowSelectionState,
    onStateChange,
  ]);

  // Notificar cambios en la selección de filas
  React.useEffect(() => {
    if (rowSelectionConfig?.onSelectionChange) {
      const selectedRows = table.getSelectedRowModel().rows;
      rowSelectionConfig.onSelectionChange(selectedRows);
    }
  }, [rowSelectionState, rowSelectionConfig, table]);

  // Colapsar filas cuando cambia el layout
  React.useEffect(() => {
    if (!needsCollapsing) {
      setExpanded({});
    }
  }, [needsCollapsing]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleExport = async () => {
    if (!exportConfig?.enableExcel) return;
    await exportToExcel(table, exportConfig);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div ref={containerRef} className={cn("space-y-4", className)}>
      {/* Toolbar superior */}
      <div className="flex flex-col gap-4">
        {/* Filtros */}
        {filtersConfig && (
          <DataTableFilters
            config={filtersConfig}
            columnFilters={columnFilters}
            onColumnFiltersChange={setColumnFilters}
          />
        )}

        {/* Toolbar con acciones */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Slot izquierdo */}
          <div className="flex items-center gap-2">{toolbarStart}</div>

          {/* Slot derecho */}
          <div className="flex items-center gap-2">
            {toolbarEnd}

            {/* Botón exportar Excel */}
            {exportConfig?.enableExcel && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="h-8"
              >
                <Download className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Exportar Excel</span>
                <span className="sm:hidden">Excel</span>
              </Button>
            )}

            {/* Toggle de columnas (ocultar si hay columnas colapsadas) */}
            {showColumnVisibility && !needsCollapsing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    <Settings2 className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Columnas</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>Mostrar columnas</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {table
                    .getAllColumns()
                    .filter(
                      (column) =>
                        typeof column.accessorFn !== "undefined" &&
                        column.getCanHide(),
                    )
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div
        className={cn(
          "rounded-md border overflow-hidden",
          maxHeight && "overflow-auto",
        )}
        style={{ maxHeight }}
      >
        <Table className={tableClassName}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="bg-muted/50">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Estado de carga
              loadingComponent ? (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    {loadingComponent}
                  </TableCell>
                </TableRow>
              ) : (
                // Skeleton por defecto
                Array.from({ length: paginationState.pageSize }).map(
                  (_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      {columns.map((_, cellIndex) => (
                        <TableCell key={`skeleton-cell-${cellIndex}`}>
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ),
                )
              )
            ) : table.getRowModel().rows?.length ? (
              // Filas de datos
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {/* Fila expandida con datos colapsados */}
                  {row.getIsExpanded() && needsCollapsing && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={columns.length} className="p-0">
                        <ExpandedRowContent
                          row={row}
                          collapsedColumns={
                            collapsedColumnDefs as ColumnDef<TData, unknown>[]
                          }
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              // Estado vacío
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    {emptyIcon && (
                      <div className="mb-3 opacity-50">{emptyIcon}</div>
                    )}
                    {typeof emptyMessage === "string" ? (
                      <p>{emptyMessage}</p>
                    ) : (
                      emptyMessage
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer con paginación */}
      {paginationConfig !== undefined && (
        <DataTablePagination table={table} config={paginationConfig} />
      )}

      {/* Footer personalizado */}
      {footer}
    </div>
  );
}

// ============================================================================
// COMPONENTES AUXILIARES EXPORTADOS
// ============================================================================

export { DataTablePagination } from "./datatable-pagination";
export { DataTableFilters } from "./datatable-filters";
export {
  DataTableColumnHeader,
  DataTableSortableHeader,
} from "./datatable-columnheader";
export { exportToExcel } from "../../utils/datatable";
export * from "../../types/datable";
