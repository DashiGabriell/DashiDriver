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

/** Tipos aceitos pelo bucket `checklists` (allowed_mime_types no Supabase Storage) */
const BUCKET_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const CHECKLIST_IMAGE_ACCEPT = 'image/*,.heic,.heif';

export function isHeicFile(file: File): boolean {
  return /^image\/hei[cf](-sequence)?$/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
}

export function isSupportedImageFile(file: File): boolean {
  return file.type.startsWith('image/') || isHeicFile(file);
}

async function reencodeAsJpeg(blob: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(blob);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Falha ao obter contexto 2D do canvas');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error('Falha ao converter imagem'))),
        'image/jpeg',
        0.9,
      );
    });
  } finally {
    bitmap.close();
  }
}

/**
 * Garante que a imagem esteja em um formato aceito pelo bucket (JPEG, PNG ou WebP).
 * Outros formatos (HEIC do iPhone, AVIF, GIF, BMP...) são convertidos para JPEG.
 */
export async function normalizeChecklistImage(file: File): Promise<File> {
  if (BUCKET_ALLOWED_TYPES.includes(file.type)) return file;

  let jpeg: Blob;
  try {
    jpeg = await reencodeAsJpeg(file);
  } catch {
    if (!isHeicFile(file)) {
      throw new Error('Formato de imagem não suportado. Use JPG, PNG, WebP ou HEIC.');
    }
    const { heicTo } = await import('heic-to');
    jpeg = await heicTo({ blob: file, type: 'image/jpeg', quality: 0.9 });
  }

  const baseName = file.name.replace(/\.[^/.]+$/, '') || 'foto';
  return new File([jpeg], `${baseName}.jpg`, { type: 'image/jpeg', lastModified: file.lastModified });
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
