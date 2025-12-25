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
  useReactTable,
  PaginationState,
  RowSelectionState,
} from "@tanstack/react-table";
import { Download, Settings2, Loader2 } from "lucide-react";

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
// COMPONENTE PRINCIPAL DATATABLE
// ============================================================================

export function DataTable<TData, TValue = unknown>({
  columns: propColumns,
  data,
  pagination: paginationConfig,
  export: exportConfig,
  filters: filtersConfig,
  rowSelection: rowSelectionConfig,
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

  // ============================================================================
  // PREPARAR COLUMNAS
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

    // Agregar las columnas del usuario
    cols.push(...propColumns);

    return cols;
  }, [propColumns, rowSelectionConfig]);

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
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelectionState,
    onPaginationChange: setPaginationState,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel:
      paginationConfig?.mode !== "server" ? getPaginationRowModel() : undefined,
    manualPagination: paginationConfig?.mode === "server",
    pageCount:
      paginationConfig?.mode === "server" && paginationConfig.totalRows
        ? Math.ceil(paginationConfig.totalRows / paginationState.pageSize)
        : undefined,
    getRowId: getRowId,
    enableRowSelection: rowSelectionConfig?.enabled,
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
    <div className={cn("space-y-4", className)}>
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
                Exportar Excel
              </Button>
            )}

            {/* Toggle de columnas */}
            {showColumnVisibility && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    <Settings2 className="mr-2 h-4 w-4" />
                    Columnas
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
                <TableRow
                  key={row.id}
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
