import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { createInspection } from "@/integrations/supabase/services/marketplaceInspectionService";
import { Loader2, Camera, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";

const InspectionPage = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const [driverName, setDriverName] = useState("");
  const [checklist, setChecklist] = useState({
    tiresOk: false,
    lightsOk: false,
    brakesOk: false,
    clean: false,
    notes: "",
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const navigate = useNavigate();

  const inspectionMutation = useMutation({
    mutationFn: () => createInspection({
      listingId: listingId!,
      driverName,
      checklistData: checklist,
      photos,
    }),
    onSuccess: () => {
      toast.success("Vistoria enviada com sucesso!");
      navigate("/marketplace/home");
    },
    onError: (error: any) => toast.error(error.message || "Erro ao enviar vistoria."),
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <h1 className="text-2xl font-black uppercase tracking-tighter mb-6">Checklist de Vistoria</h1>
      
      <div className="space-y-6">
        <div className="space-y-2">
            <Label>Nome do Motorista</Label>
            <Input value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder="Seu nome" />
        </div>

        <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-card rounded-2xl border">
                <Label>Pneus em bom estado?</Label>
                <Switch checked={checklist.tiresOk} onCheckedChange={(v) => setChecklist(f => ({...f, tiresOk: v}))} />
            </div>
            <div className="flex items-center justify-between p-4 bg-card rounded-2xl border">
                <Label>Luzes funcionando?</Label>
                <Switch checked={checklist.lightsOk} onCheckedChange={(v) => setChecklist(f => ({...f, lightsOk: v}))} />
            </div>
            <div className="flex items-center justify-between p-4 bg-card rounded-2xl border">
                <Label>Freios OK?</Label>
                <Switch checked={checklist.brakesOk} onCheckedChange={(v) => setChecklist(f => ({...f, brakesOk: v}))} />
            </div>
            <div className="flex items-center justify-between p-4 bg-card rounded-2xl border">
                <Label>Veículo limpo?</Label>
                <Switch checked={checklist.clean} onCheckedChange={(v) => setChecklist(f => ({...f, clean: v}))} />
            </div>
        </div>

        <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea value={checklist.notes} onChange={(e) => setChecklist(f => ({...f, notes: e.target.value}))} placeholder="Algum detalhe importante?" />
        </div>

        <div className="p-4 rounded-2xl bg-muted/30 space-y-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-background flex items-center justify-center">
                    <Camera className="w-6 h-6 text-primary" />
                </div>
                <Label>Fotos da Vistoria ({photos.length})</Label>
            </div>
            <label className="w-full h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center cursor-pointer gap-2">
                <PlusCircle className="w-5 h-5" /> Adicionar Fotos
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setPhotos(Array.from(e.target.files || []).slice(0, 5))} />
            </label>
        </div>

        <Button 
            className="w-full h-14 rounded-2xl" 
            onClick={() => inspectionMutation.mutate()} 
            disabled={inspectionMutation.isPending}
        >
            {inspectionMutation.isPending ? <Loader2 className="animate-spin" /> : "Enviar Vistoria"}
        </Button>
      </div>
    </div>
  );
};

export default InspectionPage;
