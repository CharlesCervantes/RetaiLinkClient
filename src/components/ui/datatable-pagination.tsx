import { Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "./button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { PaginationConfig } from "../../types/datable";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  config?: PaginationConfig;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];

export function DataTablePagination<TData>({
  table,
  config = {},
}: DataTablePaginationProps<TData>) {
  const {
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
    showPageSizeSelector = true,
    showSelectedCount = true,
    showPageNavigation = true,
    mode = "client",
    totalRows,
    onPageChange,
  } = config;

  const pageCount =
    mode === "server" && totalRows
      ? Math.ceil(totalRows / table.getState().pagination.pageSize)
      : table.getPageCount();

  const currentPage = table.getState().pagination.pageIndex + 1;

  const handlePageChange = (newPageIndex: number) => {
    table.setPageIndex(newPageIndex);
    if (mode === "server" && onPageChange) {
      onPageChange(newPageIndex, table.getState().pagination.pageSize);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    table.setPageSize(newPageSize);
    if (mode === "server" && onPageChange) {
      onPageChange(0, newPageSize);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
      {/* Información de selección */}
      {showSelectedCount && (
        <div className="text-muted-foreground text-sm order-2 sm:order-1">
          {table.getFilteredSelectedRowModel().rows.length > 0 ? (
            <>
              {table.getFilteredSelectedRowModel().rows.length} de{" "}
              {mode === "server" && totalRows
                ? totalRows
                : table.getFilteredRowModel().rows.length}{" "}
              fila(s) seleccionada(s).
            </>
          ) : (
            <>
              {mode === "server" && totalRows
                ? totalRows
                : table.getFilteredRowModel().rows.length}{" "}
              registro(s) en total.
            </>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 order-1 sm:order-2">
        {/* Selector de tamaño de página */}
        {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium whitespace-nowrap">
              Filas por página
            </p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => handlePageSizeChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Indicador de página actual */}
        {showPageNavigation && pageCount > 0 && (
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Página {currentPage} de {pageCount}
          </div>
        )}

        {/* Navegación de páginas */}
        {showPageNavigation && (
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Primera página */}
            <Button
              variant="outline"
              size="icon"
              className="hidden sm:flex h-8 w-8"
              onClick={() => handlePageChange(0)}
              disabled={!table.getCanPreviousPage()}
              title="Ir a primera página"
            >
              <span className="sr-only">Ir a primera página</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Página anterior */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handlePageChange(currentPage - 2)}
              disabled={!table.getCanPreviousPage()}
              title="Página anterior"
            >
              <span className="sr-only">Página anterior</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Página siguiente */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handlePageChange(currentPage)}
              disabled={!table.getCanNextPage()}
              title="Página siguiente"
            >
              <span className="sr-only">Página siguiente</span>
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Última página */}
            <Button
              variant="outline"
              size="icon"
              className="hidden sm:flex h-8 w-8"
              onClick={() => handlePageChange(pageCount - 1)}
              disabled={!table.getCanNextPage()}
              title="Ir a última página"
            >
              <span className="sr-only">Ir a última página</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
