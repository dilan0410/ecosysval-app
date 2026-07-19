// backend/src/common/storage/image-optimizer.service.ts
/**
 * servicio de optimización de imágenes para subir a Supabase Storage
 * -------------------------------------------------------
 * Optimiza imágenes antes de subirlas a Supabase Storage.
 *
 * Beneficios:
 * - Reduce peso 90-95% (5MB → 300KB típicamente)
 * - Convierte a WebP (formato moderno y liviano)
 * - Redimensiona a max 1920px (suficiente para web)
 * - Auto-rotación (respeta EXIF de fotos móviles)
 * - Progresivo (mejor UX al cargar)
 *
 * importante: no optimiza SVG ni GIF animados, ya que perderían calidad o animación.
 * - no optimiza SVG (ya son vectoriales)
 * - no optimiza GIF animados (perdería animación)
 * - si optimiza: JPG, JPEG, PNG, WebP, TIFF, HEIC
 */

import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { AppLoggerService } from '../logger/logger.service';

// Configuración por tipo de imagen (personalizable)
export interface OptimizeOptions {
  maxWidth?: number;    // Ancho máximo en píxeles (default: 1920)
  maxHeight?: number;   // Alto máximo en píxeles (default: 1920)
  quality?: number;     // Calidad WebP 1-100 (default: 85)
  format?: 'webp' | 'jpeg' | 'png'; // Formato de salida (default: webp)
}

// Presets predefinidos (fácil de usar)
export const IMAGE_PRESETS = {
  // Para logos y avatares (cuadrado pequeño)
  avatar: { maxWidth: 400, maxHeight: 400, quality: 85, format: 'webp' as const },
  
  // Para logos de empresas
  logo: { maxWidth: 800, maxHeight: 800, quality: 90, format: 'webp' as const },
  
  // Para banners (rectangulares)
  banner: { maxWidth: 1920, maxHeight: 600, quality: 85, format: 'webp' as const },
  
  // Para posts y publicaciones
  post: { maxWidth: 1200, maxHeight: 1200, quality: 85, format: 'webp' as const },
  
  // Genérico (default)
  default: { maxWidth: 1920, maxHeight: 1920, quality: 85, format: 'webp' as const },
};

@Injectable()
export class ImageOptimizerService {
  constructor(private readonly logger: AppLoggerService) {}

  /**
   * Optimiza una imagen y devuelve el buffer procesado.
   *
   * @param buffer - Buffer original de la imagen
   * @param mimetype - Tipo MIME original (image/jpeg, image/png, etc.)
   * @param options - Opciones de optimización (o preset)
   * @returns Objeto con buffer optimizado + nueva extensión + metadata
   */
  async optimize(
    buffer: Buffer,
    mimetype: string,
    options: OptimizeOptions = IMAGE_PRESETS.default,
  ): Promise<{
    buffer: Buffer;
    extension: string;
    mimetype: string;
    originalSize: number;
    optimizedSize: number;
    reduction: number;
  }> {
    const originalSize = buffer.length;

    // ==========================================
    // BYPASS: NO optimizar SVG ni GIF animados
    // ==========================================
    if (mimetype.includes('svg')) {
      return {
        buffer,
        extension: 'svg',
        mimetype: 'image/svg+xml',
        originalSize,
        optimizedSize: originalSize,
        reduction: 0,
      };
    }

    // GIFs pueden ser animados: los dejamos tal cual
    if (mimetype.includes('gif')) {
      return {
        buffer,
        extension: 'gif',
        mimetype: 'image/gif',
        originalSize,
        optimizedSize: originalSize,
        reduction: 0,
      };
    }

    // ==========================================
    // OPTIMIZACIÓN CON SHARP
    // ==========================================
    try {
      const opts = { ...IMAGE_PRESETS.default, ...options };

      // Pipeline de procesamiento
      let pipeline = sharp(buffer)
        .rotate() // Auto-rotación basada en EXIF (móviles)
        .resize({
          width: opts.maxWidth,
          height: opts.maxHeight,
          fit: 'inside',            // Mantiene aspect ratio, no crop
          withoutEnlargement: true, // No agranda imágenes pequeñas
        });

      // Aplicar formato de salida
      let extension: string;
      let outputMimetype: string;

      switch (opts.format) {
        case 'webp':
          pipeline = pipeline.webp({
            quality: opts.quality,
            effort: 4, // Balance entre velocidad y compresión (0-6)
          });
          extension = 'webp';
          outputMimetype = 'image/webp';
          break;

        case 'jpeg':
          pipeline = pipeline.jpeg({
            quality: opts.quality,
            progressive: true, // Carga progresiva
            mozjpeg: true,     // Compresión superior
          });
          extension = 'jpg';
          outputMimetype = 'image/jpeg';
          break;

        case 'png':
          pipeline = pipeline.png({
            quality: opts.quality,
            compressionLevel: 9,
            progressive: true,
          });
          extension = 'png';
          outputMimetype = 'image/png';
          break;

        default:
          pipeline = pipeline.webp({ quality: opts.quality });
          extension = 'webp';
          outputMimetype = 'image/webp';
      }

      // Ejecutar procesamiento
      const optimizedBuffer = await pipeline.toBuffer();
      const optimizedSize = optimizedBuffer.length;
      const reduction = Math.round(
        ((originalSize - optimizedSize) / originalSize) * 100,
      );

      // Log de la optimización
      this.logger.log(
        `Imagen optimizada: ${formatBytes(originalSize)} → ${formatBytes(optimizedSize)} (${reduction}% menos)`,
        'ImageOptimizer',
        {
          originalSize,
          optimizedSize,
          reduction,
          format: extension,
        },
      );

      return {
        buffer: optimizedBuffer,
        extension,
        mimetype: outputMimetype,
        originalSize,
        optimizedSize,
        reduction,
      };
    } catch (error) {
      // Si Sharp falla, devolver original (no bloqueamos el upload)
      this.logger.error(
        'Error al optimizar imagen — devolviendo original',
        error.stack,
        'ImageOptimizer',
        { error: error.message },
      );

      // Fallback: devolver original con extensión original
      const originalExt = mimetype.split('/')[1] || 'jpg';
      return {
        buffer,
        extension: originalExt,
        mimetype,
        originalSize,
        optimizedSize: originalSize,
        reduction: 0,
      };
    }
  }
}

/**
 * Helper: formatea bytes a MB/KB legible
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}