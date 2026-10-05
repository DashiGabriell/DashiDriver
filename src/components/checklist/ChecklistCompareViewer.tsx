import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CompareItem {
  step_key: string;
  step_label: string;
  image_url_1?: string;
  image_url_2?: string;
  taken_at_1?: string;
  taken_at_2?: string;
}

interface ChecklistCompareViewerProps {
  items: CompareItem[];
  label1: string;
  label2: string;
}

export function ChecklistCompareViewer({
  items,
  label1,
  label2,
}: ChecklistCompareViewerProps) {
  const [currentIndex, setCurrentStep] = useState(0);
  const currentItem = items[currentIndex];

  if (!currentItem) return null;

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  return (
    <div className="space-y-6">
      {/* Navegação entre passos */}
      <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg">
        <button
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="p-2 hover:bg-background rounded-full disabled:opacity-30"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        
        <div className="text-center">
          <h3 className="font-bold text-lg">{currentItem.step_label}</h3>
          <p className="text-xs text-muted-foreground">
            {currentIndex + 1} de {items.length} fotos comparadas
          </p>
        </div>

        <button
          onClick={() => setCurrentStep(prev => Math.min(items.length - 1, prev + 1))}
          disabled={currentIndex === items.length - 1}
          className="p-2 hover:bg-background rounded-full disabled:opacity-30"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Grid de Comparação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Checklist 1 */}
        <Card className="overflow-hidden bg-muted flex flex-col">
          <div className="p-2 bg-primary/10 flex justify-between items-center">
            <Badge variant="secondary">{label1}</Badge>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatDate(currentItem.taken_at_1)}
            </div>
          </div>
          <div className="flex-1 aspect-square bg-black flex items-center justify-center">
            {currentItem.image_url_1 ? (
              <img 
                src={currentItem.image_url_1} 
                alt={label1} 
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <p className="text-muted-foreground text-sm">Sem imagem</p>
            )}
          </div>
        </Card>

        {/* Checklist 2 */}
        <Card className="overflow-hidden bg-muted flex flex-col">
          <div className="p-2 bg-accent/10 flex justify-between items-center">
            <Badge variant="outline">{label2}</Badge>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatDate(currentItem.taken_at_2)}
            </div>
          </div>
          <div className="flex-1 aspect-square bg-black flex items-center justify-center">
            {currentItem.image_url_2 ? (
              <img 
                src={currentItem.image_url_2} 
                alt={label2} 
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <p className="text-muted-foreground text-sm">Sem imagem</p>
            )}
          </div>
        </Card>
      </div>

      {/* Thumbnail Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {items.map((item, idx) => (
          <button
            key={item.step_key}
            onClick={() => setCurrentStep(idx)}
            className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
              idx === currentIndex ? "border-primary scale-110 shadow-lg" : "border-transparent opacity-60"
            }`}
          >
            <img 
              src={item.image_url_1 || item.image_url_2 || "/placeholder.svg"} 
              alt={item.step_label}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
