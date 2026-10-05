import { FileText, Download, Share2, Printer, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ChecklistPDFViewerProps {
  pdfUrl?: string;
  checklistId: string;
  onGenerate?: () => Promise<void>;
  isGenerating?: boolean;
}

export function ChecklistPDFViewer({
  pdfUrl,
  checklistId,
  onGenerate,
  isGenerating,
}: ChecklistPDFViewerProps) {
  return (
    <Card className="p-6 flex flex-col items-center justify-center text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
        <FileText className="w-10 h-10 text-primary" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold">Relatório de Vistoria</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          O relatório em PDF contém todas as fotos, metadados e observações da vistoria.
        </p>
      </div>

      {!pdfUrl ? (
        <Button 
          onClick={onGenerate} 
          disabled={isGenerating}
          className="w-full max-w-xs gap-2"
        >
          {isGenerating ? "Gerando PDF..." : "Gerar Relatório PDF"}
        </Button>
      ) : (
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          <Button variant="outline" className="gap-2" asChild>
            <a href={pdfUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="w-4 h-4" />
              Ver
            </a>
          </Button>
          <Button variant="outline" className="gap-2" asChild>
            <a href={pdfUrl} download={`checklist-${checklistId}.pdf`}>
              <Download className="w-4 h-4" />
              Baixar
            </a>
          </Button>
          <Button variant="outline" className="gap-2 col-span-2">
            <Share2 className="w-4 h-4" />
            Compartilhar
          </Button>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
        ID: {checklistId}
      </p>
    </Card>
  );
}
