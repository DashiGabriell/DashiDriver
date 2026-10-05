import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export const SubscriptionModal = ({ 
  open, 
  onOpenChange,
  title = "Recurso Premium",
  description = "Esta funcionalidade é exclusiva para assinantes. Faça um upgrade do seu plano para continuar."
}: SubscriptionModalProps) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl neu border-none shadow-xl">
        <DialogHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-4 rounded-2xl mb-4">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-black">{title}</DialogTitle>
          <DialogDescription className="text-muted-foreground pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center gap-2">
          <Button 
            onClick={() => onOpenChange(false)} 
            variant="outline" 
            className="w-full rounded-2xl"
          >
            Voltar
          </Button>
          <Button 
            onClick={() => {
              onOpenChange(false);
              navigate("/checkout/plan");
            }} 
            className="w-full rounded-2xl"
          >
            Ver Planos e Assinar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
