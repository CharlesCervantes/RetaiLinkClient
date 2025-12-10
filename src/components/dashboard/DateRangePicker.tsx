import { useState, useEffect } from "react";
import { type DateRange } from "react-day-picker";
import { Calendar } from "../ui/calendar";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "../../lib/utils";

interface DateRangePickerProps {
  onDateChange?: (from: Date | undefined, to: Date | undefined) => void;
}

export function DateRangePicker({ onDateChange }: DateRangePickerProps) {
  // Establecer valores por defecto: última semana
  const getDefaultDateRange = (): DateRange => {
    const to = new Date(); // Hoy
    const from = new Date();
    from.setDate(to.getDate() - 7); // Hace 1 semana

    return { from, to };
  };

  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    getDefaultDateRange(),
  );

  // Notificar el cambio inicial con los valores por defecto
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      onDateChange?.(dateRange.from, dateRange.to);
    }
  }, []);

  const handleSelectRange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      onDateChange?.(range.from, range.to);
    }
  };

  const handleReset = () => {
    setDateRange(undefined);
    onDateChange?.(undefined, undefined);
  };

  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal min-w-[280px]",
              !dateRange && "text-slate-500 dark:text-slate-400",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "dd MMM yyyy")} -{" "}
                  {format(dateRange.to, "dd MMM yyyy")}
                </>
              ) : (
                format(dateRange.from, "dd MMM yyyy")
              )
            ) : (
              <span>Seleccionar fechas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={handleSelectRange}
            numberOfMonths={2}
            className="rounded-lg border shadow-sm"
          />
          <div className="flex gap-2 p-3 border-t border-slate-200 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex-1"
            >
              Limpiar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
