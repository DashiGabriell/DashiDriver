import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Edit2, X } from "lucide-react";

interface ChecklistImageDetailsProps {
  imageId: string;
  stepLabel: string;
  currentDetails?: string;
  currentNotes?: string;
  onSave: (details: string, notes: string) => Promise<void>;
  isSaving?: boolean;
}

export function ChecklistImageDetails({
  imageId,
  stepLabel,
  currentDetails,
  currentNotes,
  onSave,
  isSaving,
}: ChecklistImageDetailsProps) {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(currentDetails || "");
  const [notes, setNotes] = useState(currentNotes || "");

  const handleSave = async () => {
    await onSave(details, notes);
    setOpen(false);
  };

  const handleReset = () => {
    setDetails(currentDetails || "");
    setNotes(currentNotes || "");
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Edit2 className="w-4 h-4" />
        Detalhes
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Foto</DialogTitle>
            <DialogDescription>
              {stepLabel}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Detalhes */}
            <div className="space-y-2">
              <Label htmlFor="details">
                Detalhes da Foto (Opcional)
              </Label>
              <Textarea
                id="details"
                placeholder="Descreva o que está na foto, problemas encontrados, etc..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="min-h-24"
              />
              <p className="text-xs text-muted-foreground">
                {details.length}/500 caracteres
              </p>
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="notes">
                Notas Adicionais (Opcional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Adicione observações importantes sobre esta foto..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-20"
              />
              <p className="text-xs text-muted-foreground">
                {notes.length}/300 caracteres
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isSaving}
            >
              Limpar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSaving}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
