import { IMAGE_CONFIG } from './constants';

interface WatermarkConfig {
  placa: string;
  data: string;
  empresa: string;
  tipo: string;
}

/**
 * Aplica uma marca d'água com informações legais no canto inferior da imagem
 */
export async function applyWatermark(file: File, config: WatermarkConfig): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Falha ao obter contexto 2D do canvas'));
        return;
      }

      // Desenhar imagem original
      ctx.drawImage(img, 0, 0);

      // Configurar texto
      const padding = canvas.width * 0.02;
      const fontSize = Math.max(12, Math.floor(canvas.width * 0.015));
      ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
      
      const line1 = `${config.empresa.toUpperCase()} | VISTORIA: ${config.tipo.toUpperCase()}`;
      const line2 = `VEÍCULO: ${config.placa.toUpperCase()} | DATA: ${config.data}`;

      // Sombras para legibilidade
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle = '#FFFFFF';

      // Posicionamento no canto inferior direito
      const metrics1 = ctx.measureText(line1);
      const metrics2 = ctx.measureText(line2);
      const maxWidth = Math.max(metrics1.width, metrics2.width);
      
      const x = canvas.width - maxWidth - padding;
      const y2 = canvas.height - padding;
      const y1 = y2 - fontSize * 1.5;

      ctx.fillText(line1, x, y1);
      ctx.fillText(line2, x, y2);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Falha ao gerar blob com marca d\'água'));
            return;
          }
          resolve(new File([blob], `wm_${file.name}`, { type: IMAGE_CONFIG.FORMAT }));
        },
        IMAGE_CONFIG.FORMAT,
        IMAGE_CONFIG.QUALITY
      );
    };

    img.onerror = () => reject(new Error('Erro ao carregar imagem para marca d\'água'));
    reader.readAsDataURL(file);
  });
}
