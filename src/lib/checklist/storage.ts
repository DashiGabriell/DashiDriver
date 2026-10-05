import { supabase } from '@/integrations/supabase/client';
import { compressImage, generateThumbnail } from './imageProcessor';
import { applyWatermark } from './watermark';
import { STORAGE_BUCKET } from './constants';
import { format } from 'date-fns';

interface UploadResult {
  imageUrl: string;
  thumbnailUrl: string;
  watermarkedUrl: string;
  metadata: any;
}

interface UploadContext {
  companyId: string;
  vehicleId: string;
  checklistId: string;
  placa: string;
  empresa: string;
  tipo: string;
}

/**
 * Realiza o upload triplo de uma imagem de checklist
 */
export async function uploadChecklistImage(
  file: File,
  stepKey: string,
  context: UploadContext
): Promise<UploadResult> {
  const { companyId, vehicleId, checklistId, placa, empresa, tipo } = context;
  const timestamp = Date.now();
  const dateStr = format(new Date(), 'dd/MM/yyyy HH:mm');
  const basePath = `${companyId}/${vehicleId}/${checklistId}/${stepKey}_${timestamp}`;

  // 1. Processar Imagem (Compressão para WebP)
  const { file: compressedFile, metadata } = await compressImage(file);

  // 2. Gerar Thumbnail
  const thumbnailFile = await generateThumbnail(compressedFile);

  // 3. Aplicar Marca D'Água
  const watermarkedFile = await applyWatermark(compressedFile, {
    placa,
    empresa,
    tipo,
    data: dateStr,
  });

  // 4. Upload para o Supabase Storage
  const uploadTasks = [
    { path: `${basePath}_original.webp`, file: compressedFile, key: 'imageUrl' },
    { path: `${basePath}_thumb.webp`, file: thumbnailFile, key: 'thumbnailUrl' },
    { path: `${basePath}_wm.webp`, file: watermarkedFile, key: 'watermarkedUrl' },
  ];

  const results: any = {};

  for (const task of uploadTasks) {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(task.path, task.file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);

    results[task.key] = publicUrl;
  }

  return {
    imageUrl: results.imageUrl,
    thumbnailUrl: results.thumbnailUrl,
    watermarkedUrl: results.watermarkedUrl,
    metadata,
  };
}

/**
 * Remove uma imagem do storage
 */
export async function deleteStorageImage(urls: string[]): Promise<void> {
  const paths = urls.map(url => {
    const parts = url.split(`${STORAGE_BUCKET}/`);
    return parts[1] || '';
  }).filter(p => p !== '');

  if (paths.length === 0) return;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove(paths);

  if (error) throw error;
}
