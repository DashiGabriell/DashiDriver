// @ts-nocheck
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface ChecklistData {
  id: string;
  checklist_id: string;
  vehicle_placa: string;
  vehicle_modelo: string;
  vehicle_marca?: string;
  vehicle_ano?: number;
  driver_name?: string;
  type: string;
  status: string;
  notes?: string;
  started_at: string;
  finished_at?: string;
  images: Array<{
    id: string;
    image_url: string;
    thumbnail_url?: string;
    watermarked_url?: string;
    step_key: string;
    step_label: string;
    step_order?: number;
    position: number;
    details?: string;
    notes?: string;
    created_at?: string;
    taken_at?: string;
    metadata?: Record<string, any>;
  }>;
}

const typeLabels: Record<string, string> = {
  entrega: 'Entrega',
  devolucao: 'Devolução',
  avaria: 'Avaria',
  pos_manutencao: 'Manutenção',
  manutencao: 'Manutenção', // Fallback para compatibilidade
  semanal_automatizada: 'Vistoria Semanal',
};

const statusLabels: Record<string, string> = {
  em_andamento: 'Em Andamento',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
};

/**
 * Gera um PDF estruturado com todos os detalhes do checklist
 */
export async function generateChecklistPDF(data: ChecklistData): Promise<string> {
  try {
    // Criar documento PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Cores
    const primaryColor = [59, 130, 246]; // Azul
    const secondaryColor = [107, 114, 128]; // Cinza
    const lightGray = [243, 244, 246]; // Cinza claro
    const darkText = [17, 24, 39]; // Texto escuro

    // ============================================
    // CABEÃ‡ALHO
    // ============================================
    pdf.setFillColor(...lightGray);
    pdf.rect(margin, yPosition, contentWidth, 30, 'F');

    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RELATÃ“RIO DE VISTORIA', margin + 5, yPosition + 12);

    pdf.setTextColor(...secondaryColor);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`ID: ${data.checklist_id}`, margin + 5, yPosition + 22);

    yPosition += 35;

    // ============================================
    // INFORMAÃ‡Ã•ES DO VEÍCULO
    // ============================================
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('INFORMAÃ‡Ã•ES DO VEÍCULO', margin, yPosition);
    yPosition += 8;

    pdf.setDrawColor(...primaryColor);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, margin + contentWidth, yPosition);
    yPosition += 5;

    pdf.setTextColor(...darkText);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    const vehicleInfo = [
      [`Placa: ${data.vehicle_placa}`, `Modelo: ${data.vehicle_modelo}`],
      [`Marca: ${data.vehicle_marca || 'N/A'}`, `Ano: ${data.vehicle_ano || 'N/A'}`],
    ];

    vehicleInfo.forEach((row) => {
      pdf.text(row[0], margin + 5, yPosition);
      pdf.text(row[1], margin + contentWidth / 2, yPosition);
      yPosition += 7;
    });

    yPosition += 5;

    // ============================================
    // INFORMAÃ‡Ã•ES DO CHECKLIST
    // ============================================
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('INFORMAÃ‡Ã•ES DO CHECKLIST', margin, yPosition);
    yPosition += 8;

    pdf.setDrawColor(...primaryColor);
    pdf.line(margin, yPosition, margin + contentWidth, yPosition);
    yPosition += 5;

    pdf.setTextColor(...darkText);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    const checklistInfo = [
      [`Tipo: ${typeLabels[data.type] || data.type}`, `Status: ${statusLabels[data.status] || data.status}`],
      [
        `Motorista: ${data.driver_name || 'Não informado'}`,
        `Iniciado em: ${format(new Date(data.started_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`,
      ],
    ];

    if (data.finished_at) {
      checklistInfo.push([
        `Finalizado em: ${format(new Date(data.finished_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`,
        '',
      ]);
    }

    checklistInfo.forEach((row) => {
      pdf.text(row[0], margin + 5, yPosition);
      if (row[1]) {
        pdf.text(row[1], margin + contentWidth / 2, yPosition);
      }
      yPosition += 7;
    });

    // Notas gerais
    if (data.notes) {
      yPosition += 5;
      pdf.setTextColor(...primaryColor);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('OBSERVAÃ‡Ã•ES GERAIS', margin, yPosition);
      yPosition += 8;

      pdf.setDrawColor(...primaryColor);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, margin + contentWidth, yPosition);
      yPosition += 5;

      pdf.setTextColor(...darkText);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const observationLines = pdf.splitTextToSize(data.notes, contentWidth - 10);
      pdf.text(observationLines, margin + 5, yPosition);
      yPosition += observationLines.length * 5 + 5;
    }

    yPosition += 5;

    // ============================================
    // FOTOS E DETALHES
    // ============================================
    if (data.images && data.images.length > 0) {
      pdf.setTextColor(...primaryColor);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`FOTOS (${data.images.length})`, margin, yPosition);
      yPosition += 8;

      pdf.setDrawColor(...primaryColor);
      pdf.line(margin, yPosition, margin + contentWidth, yPosition);
      yPosition += 8;

      // Processar cada imagem
      for (let i = 0; i < data.images.length; i++) {
        const image = data.images[i];

        // Verificar se precisa de nova página
        if (yPosition > pageHeight - 80) {
          pdf.addPage();
          yPosition = margin;
        }

        // Número da foto
        pdf.setTextColor(...primaryColor);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Foto ${image.position}: ${image.step_label}`, margin + 5, yPosition);
        yPosition += 6;

        // Informações da foto
        pdf.setTextColor(...secondaryColor);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        
        // Validar data antes de formatar
        const photoDate = image.created_at || image.taken_at;
        if (photoDate) {
          try {
            const dateObj = new Date(photoDate);
            if (!isNaN(dateObj.getTime())) {
              pdf.text(
                `Data: ${format(dateObj, 'dd/MM/yyyy HH:mm', { locale: ptBR })}`,
                margin + 5,
                yPosition
              );
            }
          } catch (e) {

          }
        }
        yPosition += 5;

        // Detalhes da foto
        if (image.details) {
          pdf.setTextColor(...darkText);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          const detailsLines = pdf.splitTextToSize(`Detalhes: ${image.details}`, contentWidth - 10);
          pdf.text(detailsLines, margin + 5, yPosition);
          yPosition += detailsLines.length * 4 + 2;
        }

        // Notas da foto
        if (image.notes) {
          pdf.setTextColor(...secondaryColor);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'italic');
          const notesLines = pdf.splitTextToSize(`Notas: ${image.notes}`, contentWidth - 10);
          pdf.text(notesLines, margin + 5, yPosition);
          yPosition += notesLines.length * 4 + 2;
        }

        // Tentar carregar e adicionar a imagem
        try {
          const imgData = await loadImageAsBase64(image.image_url);
          if (imgData) {
            // Verificar se precisa de nova página para a imagem
            if (yPosition > pageHeight - 100) {
              pdf.addPage();
              yPosition = margin;
            }

            const imgWidth = contentWidth - 10;
            const imgHeight = (imgWidth * 3) / 4; // Proporção 4:3

            pdf.addImage(imgData, 'JPEG', margin + 5, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 8;
          }
        } catch (error) {

          // Continuar sem a imagem
          yPosition += 5;
        }

        // Separador entre fotos
        if (i < data.images.length - 1) {
          yPosition += 3;
          pdf.setDrawColor(200, 200, 200);
          pdf.setLineWidth(0.3);
          pdf.line(margin + 5, yPosition, margin + contentWidth - 5, yPosition);
          yPosition += 5;
        }
      }
    }

    // ============================================
    // RODAPÃ‰
    // ============================================
    const footerY = pageHeight - 10;
    pdf.setTextColor(...secondaryColor);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      `Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}`,
      margin,
      footerY
    );
    pdf.text(`Página ${pdf.internal.pages.length - 1}`, pageWidth - margin - 20, footerY);

    // Converter para blob e criar URL
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    return pdfUrl;
  } catch (error) {

    throw new Error('Falha ao gerar relatório PDF');
  }
}

/**
 * Carrega uma imagem e converte para base64
 */
async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {

    return null;
  }
}

/**
 * Compartilha o PDF usando Web Share API
 */
export async function sharePDF(pdfUrl: string, filename: string): Promise<void> {
  try {
    const response = await fetch(pdfUrl);
    const blob = await response.blob();

    if (navigator.share) {
      const file = new File([blob], filename, { type: 'application/pdf' });
      await navigator.share({
        files: [file],
        title: 'Relatório de Vistoria',
        text: 'Compartilhando relatório de vistoria',
      });
    } else {
      // Fallback: download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = filename;
      link.click();
    }
  } catch (error) {

    throw error;
  }
}
