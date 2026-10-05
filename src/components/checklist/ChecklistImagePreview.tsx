import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Maximize2, Trash2, RefreshCcw, Info, Calendar, Clock, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChecklistImagePreviewProps {
  imageUrl: string;
  stepLabel: string;
  takenAt?: Date | string;
  size?: number; // em bytes
  onDelete?: () => void;
  onReplace?: () => void;
}

export function ChecklistImagePreview({
  imageUrl,
  stepLabel,
  takenAt,
  size,
  onDelete,
  onReplace,
}: ChecklistImagePreviewProps) {
  const formattedDate = takenAt 
    ? format(new Date(takenAt), "dd 'de' MMMM", { locale: ptBR })
    : null;
  const formattedTime = takenAt 
    ? format(new Date(takenAt), "HH:mm")
    : null;
  
  const fileSizeMB = size ? (size / (1024 * 1024)).toFixed(2) : null;

  return (
    <Card className="group relative overflow-hidden bg-muted aspect-square">
      <img
        src={imageUrl}
        alt={stepLabel}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* Overlay com Ações */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button size="icon" variant="secondary" className="h-9 w-9 rounded-full">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none">
            <DialogHeader className="absolute top-4 left-4 z-10 text-white drop-shadow-md">
              <DialogTitle className="text-xl font-bold">{stepLabel}</DialogTitle>
              {formattedDate && (
                <p className="text-sm opacity-80">{formattedDate} às {formattedTime}</p>
              )}
            </DialogHeader>
            <div className="flex items-center justify-center min-h-[50vh] max-h-[85vh]">
              <img src={imageUrl} alt={stepLabel} className="max-w-full max-h-full object-contain" />
            </div>
          </DialogContent>
        </Dialog>

        {onReplace && (
          <Button 
            size="icon" 
            variant="secondary" 
            className="h-9 w-9 rounded-full"
            onClick={onReplace}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        )}

        {onDelete && (
          <Button 
            size="icon" 
            variant="destructive" 
            className="h-9 w-9 rounded-full"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Label Inferior */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-white uppercase tracking-wider truncate mr-2">
            {stepLabel}
          </span>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-white/70 hover:text-white transition-colors">
                  <Info className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="p-3 space-y-2">
                {formattedDate && (
                  <div className="flex items-center gap-2 text-xs">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>{formattedDate}</span>
                  </div>
                )}
                {formattedTime && (
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>{formattedTime}</span>
                  </div>
                )}
                {fileSizeMB && (
                  <div className="flex items-center gap-2 text-xs">
                    <HardDrive className="h-3 w-3 text-muted-foreground" />
                    <span>{fileSizeMB} MB</span>
                  </div>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </Card>
  );
}
