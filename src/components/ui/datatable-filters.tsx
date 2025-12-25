import * as React from "react";
import { ColumnFiltersState } from "@tanstack/react-table";
import { X, Search, CalendarIcon, Check } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Input } from "./input";
import { Badge } from "./badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Calendar } from "./calendar";
import { Checkbox } from "./checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./command";

import { FiltersConfig, FilterConfig, FilterOption } from "../../types/datable";
import { debounce } from "../../utils/datatable";

interface DataTableFiltersProps {
  config: FiltersConfig;
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: (filters: ColumnFiltersState) => void;
}

export function DataTableFilters({
  config,
  columnFilters,
  onColumnFiltersChange,
}: DataTableFiltersProps) {
  const {
    filters,
    showClearButton = true,
    layout = "inline",
    gridCols = 4,
    debounceMs = 300,
  } = config;

  const hasActiveFilters = columnFilters.length > 0;

  // Obtener el valor actual de un filtro
  const getFilterValue = (filterId: string): unknown => {
    const filter = columnFilters.find((f) => f.id === filterId);
    return filter?.value;
  };

  // Actualizar un filtro
  const updateFilter = (filterId: string, value: unknown) => {
    const newFilters = columnFilters.filter((f) => f.id !== filterId);
    if (value !== undefined && value !== null && value !== "") {
      newFilters.push({ id: filterId, value });
    }
    onColumnFiltersChange(newFilters);
    config.onFiltersChange?.(newFilters);
  };

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    onColumnFiltersChange([]);
    config.onFiltersChange?.([]);
  };

  // Determinar las clases de layout
  const layoutClasses = {
    inline: "flex flex-wrap items-end gap-3",
    stacked: "flex flex-col gap-3",
    grid: `grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-${gridCols}`,
  };

  return (
    <div className="space-y-4">
      <div className={layoutClasses[layout]}>
        {filters.map((filterConfig) => (
          <FilterInput
            key={filterConfig.id}
            config={filterConfig}
            value={getFilterValue(filterConfig.id)}
            onChange={(value) => updateFilter(filterConfig.id, value)}
            debounceMs={debounceMs}
          />
        ))}

        {/* Botón limpiar filtros */}
        {showClearButton && hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearAllFilters}
            className="h-9 px-3"
          >
            <X className="mr-2 h-4 w-4" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Mostrar filtros activos como badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {columnFilters.map((filter) => {
            const filterConfig = filters.find((f) => f.id === filter.id);
            if (!filterConfig) return null;

            return (
              <Badge key={filter.id} variant="secondary" className="gap-1 pr-1">
                <span className="font-medium">{filterConfig.label}:</span>
                <span className="text-muted-foreground">
                  {formatFilterValue(filter.value, filterConfig)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 hover:bg-transparent"
                  onClick={() => updateFilter(filter.id, undefined)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTE DE INPUT DE FILTRO
// ============================================================================

interface FilterInputProps {
  config: FilterConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  debounceMs: number;
}

function FilterInput({
  config,
  value,
  onChange,
  debounceMs,
}: FilterInputProps) {
  const { type, label, placeholder, className } = config;

  switch (type) {
    case "text":
      return (
        <TextFilter
          config={config}
          value={value as string}
          onChange={onChange}
          debounceMs={debounceMs}
        />
      );
    case "select":
      return (
        <SelectFilter
          config={config}
          value={value as string}
          onChange={onChange}
        />
      );
    case "multiselect":
      return (
        <MultiselectFilter
          config={config}
          value={value as string[]}
          onChange={onChange}
        />
      );
    case "date":
      return (
        <DateFilter config={config} value={value as Date} onChange={onChange} />
      );
    case "daterange":
      return (
        <DateRangeFilter
          config={config}
          value={value as [Date | null, Date | null]}
          onChange={onChange}
        />
      );
    case "number":
      return (
        <NumberFilter
          config={config}
          value={value as number}
          onChange={onChange}
          debounceMs={debounceMs}
        />
      );
    case "boolean":
      return (
        <BooleanFilter
          config={config}
          value={value as boolean | null}
          onChange={onChange}
        />
      );
    default:
      return null;
  }
}

// ============================================================================
// FILTROS INDIVIDUALES
// ============================================================================

// Filtro de texto
function TextFilter({
  config,
  value,
  onChange,
  debounceMs,
}: {
  config: FilterConfig;
  value: string | undefined;
  onChange: (value: string) => void;
  debounceMs: number;
}) {
  const [localValue, setLocalValue] = React.useState(value || "");

  // Sincronizar valor externo
  React.useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  // Debounce del onChange
  const debouncedOnChange = React.useMemo(
    () => debounce((val: string) => onChange(val), debounceMs),
    [onChange, debounceMs],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };

  return (
    <div className={cn("flex flex-col gap-1.5", config.className)}>
      <label className="text-sm font-medium text-muted-foreground">
        {config.label}
      </label>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={
            config.placeholder || `Buscar ${config.label.toLowerCase()}...`
          }
          value={localValue}
          onChange={handleChange}
          className="pl-8 h-9"
        />
      </div>
    </div>
  );
}

// Valor especial para representar "todos" (no puede ser string vacío en Radix)
const ALL_VALUE = "__all__";

// Filtro select
function SelectFilter({
  config,
  value,
  onChange,
}: {
  config: FilterConfig;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}) {
  const handleChange = (val: string) => {
    // Si selecciona "Todos", limpiamos el filtro
    onChange(val === ALL_VALUE ? undefined : val);
  };

  return (
    <div className={cn("flex flex-col gap-1.5", config.className)}>
      <label className="text-sm font-medium text-muted-foreground">
        {config.label}
      </label>
      <Select value={value || ALL_VALUE} onValueChange={handleChange}>
        <SelectTrigger className="h-9 w-[180px]">
          <SelectValue placeholder={config.placeholder || "Seleccionar..."} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Todos</SelectItem>
          {config.options?.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <span className="flex items-center gap-2">
                {option.icon}
                {option.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Filtro multiselect con Command
function MultiselectFilter({
  config,
  value,
  onChange,
}: {
  config: FilterConfig;
  value: string[] | undefined;
  onChange: (value: string[]) => void;
}) {
  const selectedValues = new Set(value || []);
  const options = config.options || [];

  return (
    <div className={cn("flex flex-col gap-1.5", config.className)}>
      <label className="text-sm font-medium text-muted-foreground">
        {config.label}
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-9 justify-start">
            {selectedValues.size > 0 ? (
              <>
                <Badge variant="secondary" className="mr-2 rounded-sm">
                  {selectedValues.size}
                </Badge>
                {selectedValues.size <= 2
                  ? options
                      .filter((opt) => selectedValues.has(opt.value))
                      .map((opt) => opt.label)
                      .join(", ")
                  : `${selectedValues.size} seleccionados`}
              </>
            ) : (
              <span className="text-muted-foreground">
                {config.placeholder || "Seleccionar..."}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder={`Buscar ${config.label.toLowerCase()}...`}
            />
            <CommandList>
              <CommandEmpty>No se encontraron resultados.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = selectedValues.has(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => {
                        const newValues = new Set(selectedValues);
                        if (isSelected) {
                          newValues.delete(option.value);
                        } else {
                          newValues.add(option.value);
                        }
                        onChange(Array.from(newValues));
                      }}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible",
                        )}
                      >
                        <Check className="h-4 w-4" />
                      </div>
                      {option.icon}
                      <span>{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              {selectedValues.size > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => onChange([])}
                      className="justify-center text-center"
                    >
                      Limpiar filtros
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Filtro de fecha
function DateFilter({
  config,
  value,
  onChange,
}: {
  config: FilterConfig;
  value: Date | undefined;
  onChange: (value: Date | undefined) => void;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", config.className)}>
      <label className="text-sm font-medium text-muted-foreground">
        {config.label}
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-9 w-[180px] justify-start text-left font-normal",
              !value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value
              ? format(value, "PPP", { locale: es })
              : config.placeholder || "Seleccionar fecha"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            initialFocus
            locale={es}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Filtro de rango de fechas
function DateRangeFilter({
  config,
  value,
  onChange,
}: {
  config: FilterConfig;
  value: [Date | null, Date | null] | undefined;
  onChange: (value: [Date | null, Date | null]) => void;
}) {
  const [from, to] = value || [null, null];

  return (
    <div className={cn("flex flex-col gap-1.5", config.className)}>
      <label className="text-sm font-medium text-muted-foreground">
        {config.label}
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-9 w-[240px] justify-start text-left font-normal",
              !from && !to && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {from ? (
              to ? (
                <>
                  {format(from, "dd/MM/yy")} - {format(to, "dd/MM/yy")}
                </>
              ) : (
                format(from, "dd/MM/yyyy")
              )
            ) : (
              config.placeholder || "Seleccionar rango"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{ from: from || undefined, to: to || undefined }}
            onSelect={(range) => {
              onChange([range?.from || null, range?.to || null]);
            }}
            numberOfMonths={2}
            locale={es}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Filtro numérico
function NumberFilter({
  config,
  value,
  onChange,
  debounceMs,
}: {
  config: FilterConfig;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  debounceMs: number;
}) {
  const [localValue, setLocalValue] = React.useState(value?.toString() || "");

  React.useEffect(() => {
    setLocalValue(value?.toString() || "");
  }, [value]);

  const debouncedOnChange = React.useMemo(
    () =>
      debounce((val: string) => {
        const num = val ? Number(val) : undefined;
        onChange(num);
      }, debounceMs),
    [onChange, debounceMs],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };

  return (
    <div className={cn("flex flex-col gap-1.5", config.className)}>
      <label className="text-sm font-medium text-muted-foreground">
        {config.label}
      </label>
      <Input
        type="number"
        placeholder={config.placeholder || "0"}
        value={localValue}
        onChange={handleChange}
        min={config.min}
        max={config.max}
        className="h-9 w-[120px]"
      />
    </div>
  );
}

// Filtro booleano
function BooleanFilter({
  config,
  value,
  onChange,
}: {
  config: FilterConfig;
  value: boolean | null | undefined;
  onChange: (value: boolean | null) => void;
}) {
  const options = config.options || [
    { label: "Sí", value: "true" },
    { label: "No", value: "false" },
  ];

  // Convertir el valor booleano a string para el Select
  const selectValue =
    value === null || value === undefined ? ALL_VALUE : String(value);

  const handleChange = (val: string) => {
    if (val === ALL_VALUE) {
      onChange(null);
    } else {
      onChange(val === "true");
    }
  };

  return (
    <div className={cn("flex flex-col gap-1.5", config.className)}>
      <label className="text-sm font-medium text-muted-foreground">
        {config.label}
      </label>
      <Select value={selectValue} onValueChange={handleChange}>
        <SelectTrigger className="h-9 w-[140px]">
          <SelectValue placeholder={config.placeholder || "Todos"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Todos</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function formatFilterValue(value: unknown, config: FilterConfig): string {
  if (value === null || value === undefined) return "";

  switch (config.type) {
    case "multiselect":
      const values = value as string[];
      const labels = values.map((v) => {
        const opt = config.options?.find((o) => o.value === v);
        return opt?.label || v;
      });
      return labels.join(", ");
    case "date":
      return format(value as Date, "dd/MM/yyyy");
    case "daterange":
      const [from, to] = value as [Date | null, Date | null];
      if (from && to)
        return `${format(from, "dd/MM")} - ${format(to, "dd/MM")}`;
      if (from) return `Desde ${format(from, "dd/MM")}`;
      if (to) return `Hasta ${format(to, "dd/MM")}`;
      return "";
    case "boolean":
      const boolOpts = config.options || [
        { label: "Sí", value: "true" },
        { label: "No", value: "false" },
      ];
      return (
        boolOpts.find((o) => o.value === String(value))?.label || String(value)
      );
    case "select":
      const opt = config.options?.find((o) => o.value === value);
      return opt?.label || String(value);
    default:
      return String(value);
  }
}
