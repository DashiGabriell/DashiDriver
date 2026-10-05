import { IMAGE_CONFIG } from './constants';

export interface ImageMetadata {
  originalSize: number;
  finalSize: number;
  originalDimensions: { width: number; height: number };
  finalDimensions: { width: number; height: number };
  device: string;
  compressed: boolean;
  timestamp: string;
}

/**
 * Comprime e redimensiona uma imagem, convertendo para WebP
 */
export async function compressImage(file: File): Promise<{ file: File; metadata: ImageMetadata }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Redimensionar mantendo proporção se exceder limites
      if (width > IMAGE_CONFIG.MAX_WIDTH || height > IMAGE_CONFIG.MAX_HEIGHT) {
        if (width > height) {
          height *= IMAGE_CONFIG.MAX_WIDTH / width;
          width = IMAGE_CONFIG.MAX_WIDTH;
        } else {
          width *= IMAGE_CONFIG.MAX_HEIGHT / height;
          height = IMAGE_CONFIG.MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Falha ao obter contexto 2D do canvas'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Falha ao gerar blob da imagem'));
            return;
          }

          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
            type: IMAGE_CONFIG.FORMAT,
          });

          const metadata: ImageMetadata = {
            originalSize: file.size,
            finalSize: compressedFile.size,
            originalDimensions: { width: img.width, height: img.height },
            finalDimensions: { width, height },
            device: navigator.userAgent,
            compressed: true,
            timestamp: new Date().toISOString(),
          };

          resolve({ file: compressedFile, metadata });
        },
        IMAGE_CONFIG.FORMAT,
        IMAGE_CONFIG.QUALITY
      );
    };

    img.onerror = () => reject(new Error('Erro ao carregar imagem'));
    reader.readAsDataURL(file);
  });
}

/**
 * Gera um thumbnail para visualização rápida
 */
export async function generateThumbnail(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = IMAGE_CONFIG.THUMBNAIL_WIDTH;
      canvas.height = IMAGE_CONFIG.THUMBNAIL_HEIGHT;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Falha ao obter contexto 2D do canvas'));
        return;
      }

      // Preenchimento mantendo proporção (crop centralizado)
      const ratio = Math.max(
        IMAGE_CONFIG.THUMBNAIL_WIDTH / img.width,
        IMAGE_CONFIG.THUMBNAIL_HEIGHT / img.height
      );
      const x = (IMAGE_CONFIG.THUMBNAIL_WIDTH - img.width * ratio) / 2;
      const y = (IMAGE_CONFIG.THUMBNAIL_HEIGHT - img.height * ratio) / 2;

      ctx.drawImage(img, x, y, img.width * ratio, img.height * ratio);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Falha ao gerar blob do thumbnail'));
            return;
          }
          resolve(new File([blob], `thumb_${file.name}`, { type: IMAGE_CONFIG.FORMAT }));
        },
        IMAGE_CONFIG.FORMAT,
        IMAGE_CONFIG.THUMBNAIL_QUALITY
      );
    };

    img.onerror = () => reject(new Error('Erro ao carregar imagem para thumbnail'));
    reader.readAsDataURL(file);
  });
}
