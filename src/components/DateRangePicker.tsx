import { useState } from "react";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
  className?: string;
}

export function DateRangePicker({
  date,
  onDateChange,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // ──── Helper: Período padrão (1º ao último dia do mês) ────────────────
  const getDefaultDateRange = (): DateRange => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { from: firstDay, to: lastDay };
  };

  const presets = [
    {
      label: "Este mês",
      getValue: getDefaultDateRange,
    },
    {
      label: "Hoje",
      getValue: () => {
        const today = new Date();
        return { from: today, to: today };
      },
    },
    {
      label: "Últimos 7 dias",
      getValue: () => {
        const today = new Date();
        const from = new Date(today);
        from.setDate(from.getDate() - 6);
        return { from, to: today };
      },
    },
    {
      label: "Últimos 30 dias",
      getValue: () => {
        const today = new Date();
        const from = new Date(today);
        from.setDate(from.getDate() - 29);
        return { from, to: today };
      },
    },
    {
      label: "Mês passado",
      getValue: () => {
        const today = new Date();
        const from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const to = new Date(today.getFullYear(), today.getMonth(), 0);
        return { from, to };
      },
    },
    {
      label: "Este ano",
      getValue: () => {
        const today = new Date();
        const from = new Date(today.getFullYear(), 0, 1);
        return { from, to: today };
      },
    },
  ];

  const handlePresetClick = (getValue: () => DateRange) => {
    onDateChange(getValue());
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDateChange(getDefaultDateRange());
  };

  const formatDateRange = () => {
    if (!date?.from) {
      return "Selecione o período";
    }

    // Verificar se é o período padrão (mês atual)
    const defaultRange = getDefaultDateRange();
    const isDefaultRange =
      date.from?.toDateString() === defaultRange.from?.toDateString() &&
      date.to?.toDateString() === defaultRange.to?.toDateString();

    if (isDefaultRange) {
      return "Este mês completo";
    }

    if (!date.to || date.from === date.to) {
      return format(date.from, "dd 'de' MMMM, yyyy", { locale: ptBR });
    }

    return `${format(date.from, "dd MMM", { locale: ptBR })} - ${format(
      date.to,
      "dd MMM, yyyy",
      { locale: ptBR }
    )}`;
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal neu-interactive group relative",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span className="flex-1">{formatDateRange()}</span>
            {date?.from && (
              <X
                className="h-4 w-4 ml-2 opacity-50 hover:opacity-100 transition-opacity"
                onClick={handleClear}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="flex">
            {/* Presets Sidebar */}
            <div className="border-r p-3 space-y-1 min-w-[140px]">
              <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                Períodos
              </div>
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sm font-normal"
                  onClick={() => handlePresetClick(preset.getValue)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {/* Calendar */}
            <div className="p-3">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={onDateChange}
                numberOfMonths={2}
                locale={ptBR}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
