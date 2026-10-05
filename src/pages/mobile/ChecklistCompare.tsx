import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MobileHeader from "@/layouts/mobile/MobileHeader";
import { ChecklistCompareViewer } from "@/components/checklist/ChecklistCompareViewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Split, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Mock data for comparison
const MOCK_COMPARE_ITEMS = [
  {
    step_key: "frente",
    step_label: "Frente",
    image_url_1: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400",
    image_url_2: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400",
    taken_at_1: "2026-05-10T10:00:00Z",
    taken_at_2: "2026-05-16T14:30:00Z",
  },
  {
    step_key: "traseira",
    step_label: "Traseira",
    image_url_1: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=400",
    image_url_2: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=400",
    taken_at_1: "2026-05-10T10:02:00Z",
    taken_at_2: "2026-05-16T14:32:00Z",
  }
];

const ChecklistCompare = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedChecklistId, setSelectedChecklistId] = useState<string>("");

  return (
    <div className="animate-fade-in pb-10">
      <MobileHeader />
      
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Comparação Visual</h1>
            <p className="text-xs text-muted-foreground">Compare o estado atual com vistorias anteriores.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Checklist para Comparar
            </Label>
            <Select value={selectedChecklistId} onValueChange={setSelectedChecklistId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um checklist anterior" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="c1">10/05/2026 - Entrega (João Silva)</SelectItem>
                <SelectItem value="c2">01/05/2026 - Pós Manutenção</SelectItem>
                <SelectItem value="c3">15/04/2026 - Auditoria</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!selectedChecklistId ? (
            <div className="py-20 text-center space-y-4 bg-muted/20 rounded-xl border border-dashed">
              <Split className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <p className="text-muted-foreground text-sm px-10">
                Selecione um checklist anterior para ver as fotos lado a lado e identificar avarias.
              </p>
            </div>
          ) : (
            <ChecklistCompareViewer 
              items={MOCK_COMPARE_ITEMS}
              label1="Anterior (10/05)"
              label2="Atual (16/05)"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChecklistCompare;
