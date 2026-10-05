import { FileText, Download, Share2, Printer, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChecklistPDFModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checklistId: string | null;
  pdfUrl: string | null;
  isGenerating: boolean;
  error?: string | null;
  onGenerate: () => Promise<any>;
  onDownload?: () => void;
  onShare?: () => Promise<void>;
}

export function ChecklistPDFModal({
  open,
  onOpenChange,
  checklistId,
  pdfUrl,
  isGenerating,
  error,
  onGenerate,
  onDownload,
  onShare,
}: ChecklistPDFModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Relatório de Vistoria - PDF
          </DialogTitle>
          <DialogDescription>
            {checklistId && `ID do Checklist: ${checklistId}`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {isGenerating ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground">
                  Gerando relatório PDF...
                </p>
                <p className="text-xs text-muted-foreground">
                  Isso pode levar alguns segundos
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-4">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                  <p className="text-muted-foreground">
                    Erro ao gerar o relatório
                  </p>
                  <Button onClick={onGenerate} className="gap-2">
                    <FileText className="w-4 h-4" />
                    Tentar Novamente
                  </Button>
                </div>
              </div>
            </div>
          ) : pdfUrl ? (
            <div className="space-y-4">
              {/* Visualizador de PDF */}
              <div className="border rounded-lg overflow-hidden bg-gray-100 p-4">
                <div className="bg-white p-4 rounded border">
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    ✅ PDF gerado com sucesso!
                  </p>
                  <p className="text-sm text-center text-muted-foreground">
                    O relatório está pronto para download ou compartilhamento.
                  </p>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 justify-end pt-4 border-t flex-wrap">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={onDownload}
                >
                  <Download className="w-4 h-4" />
                  Baixar PDF
                </Button>
                {onShare && (
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={onShare}
                  >
                    <Share2 className="w-4 h-4" />
                    Compartilhar
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    if (pdfUrl) {
                      window.open(pdfUrl, '_blank');
                    }
                  }}
                >
                  <Printer className="w-4 h-4" />
                  Imprimir
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Clique no botão abaixo para gerar o relatório em PDF
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-4">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">
                    Nenhum PDF gerado ainda
                  </p>
                  <Button onClick={onGenerate} className="gap-2">
                    <FileText className="w-4 h-4" />
                    Gerar Relatório PDF
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
