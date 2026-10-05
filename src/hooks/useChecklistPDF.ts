import { useState, useCallback } from 'react';
import { generateChecklistPDF, sharePDF } from '@/lib/checklist/pdfGenerator';
import { checklistService } from '@/integrations/supabase/services/checklistService';
import { toast } from 'sonner';

export function useChecklistPDF() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (checklistId: string) => {
    try {
      setIsGenerating(true);
      setError(null);
      setPdfUrl(null);

      const data = await checklistService.getById(checklistId);

      if (!data) {
        throw new Error('Checklist não encontrado');
      }

      const url = await generateChecklistPDF(data);

      setPdfUrl(url);
      toast.success('Relatório gerado com sucesso!');
      return url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';

      setError(errorMessage);
      toast.error(`Erro ao gerar relatório: ${errorMessage}`);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const share = useCallback(async (checklistId: string) => {
    try {
      const url = pdfUrl || (await generate(checklistId));
      if (url) {
        await sharePDF(url, `vistoria-${checklistId}.pdf`);
        toast.success('PDF compartilhado com sucesso!');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao compartilhar';

      toast.error(errorMessage);
    }
  }, [pdfUrl, generate]);

  const reset = useCallback(() => {
    setPdfUrl(null);
    setError(null);
  }, []);

  const download = useCallback((checklistId?: string) => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `checklist-${checklistId || 'relatorio'}.pdf`;
      link.click();
      toast.success('PDF baixado com sucesso!');
    }
  }, [pdfUrl]);

  return {
    generate,
    share,
    download,
    reset,
    isGenerating,
    pdfUrl,
    error,
  };
}
