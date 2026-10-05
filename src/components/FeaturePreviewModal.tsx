import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FeaturePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FeaturePreviewModal = ({ open, onOpenChange }: FeaturePreviewModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl neu border-none shadow-xl text-center">
        <DialogHeader>
          <div className="mx-auto mb-4">
            <img src="/logo.png" alt="DashiDrive Logo" className="w-16 h-16 mx-auto object-contain" />
          </div>
          <DialogTitle className="text-2xl font-black">Em breve!</DialogTitle>
          <DialogDescription className="text-muted-foreground pt-2">
            Estamos trabalhando para trazer essa funcionalidade o mais rápido possível.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button 
            onClick={() => onOpenChange(false)} 
            className="w-full rounded-2xl"
          >
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
