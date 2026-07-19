// backend/src/common/storage/storage.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
// SHARP + WINSTON
import {
  ImageOptimizerService,
  IMAGE_PRESETS,
  OptimizeOptions,
} from './image-optimizer.service';
import { AppLoggerService } from '../logger/logger.service';

@Injectable()
export class StorageService implements OnModuleInit {
  private supabase: SupabaseClient;
  private bucket: string;

  constructor(
    // SHARP + WINSTON
    private readonly imageOptimizer: ImageOptimizerService,
    private readonly logger: AppLoggerService,
  ) {}

  onModuleInit() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    this.bucket = process.env.SUPABASE_BUCKET || 'ecosysval-media';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Faltan las variables de entorno de Supabase en el Backend.');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.logger.log('StorageService inicializado con Supabase + Sharp', 'StorageService');
  }

  /**
   * Sube un archivo a Supabase Storage.
   *
   * Si es una imagen, la optimiza automaticamente con Sharp antes de subir.
   * Si no es imagen (PDF, docs), la sube tal cual.
   *
   * @param file - Archivo subido por Multer
   * @param folder - Carpeta destino (ej: 'profile_images', 'logos', etc.)
   * @param optimizeOptions - Opciones específicas de optimización (opcional)
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string,
    optimizeOptions?: OptimizeOptions,
  ): Promise<string> {
    if (!file) {
      throw new Error('No se ha proporcionado ningún archivo para subir.');
    }

    // ==========================================
    // OPTIMIZACIÓN DE IMÁGENES (si aplica)
    // ==========================================
    let finalBuffer = file.buffer;
    let finalMimetype = file.mimetype;
    let finalExtension = file.originalname.split('.').pop() || 'bin';

    const isImage = file.mimetype.startsWith('image/');

    if (isImage) {
      try {
        // Elegir preset según la carpeta destino
        const preset = getPresetByFolder(folder, optimizeOptions);

        // Optimizar
        const result = await this.imageOptimizer.optimize(
          file.buffer,
          file.mimetype,
          preset,
        );

        // Usar resultado optimizado
        finalBuffer = result.buffer;
        finalMimetype = result.mimetype;
        finalExtension = result.extension;
      } catch (error) {
        // Si falla la optimización, seguir con el original (no bloquear upload)
        this.logger.warn(
          'Optimización falló, subiendo original',
          'StorageService',
          { error: error.message, folder },
        );
      }
    }

    // ==========================================
    // UPLOAD A SUPABASE (con archivo optimizado)
    // ==========================================
    const fileName = `${folder}/${Date.now()}-${Math.floor(Math.random() * 10000)}.${finalExtension}`;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(fileName, finalBuffer, {
        contentType: finalMimetype,
        upsert: true,
      });

    if (error) {
      this.logger.error(
        `Error al subir archivo a Supabase Storage`,
        error.message,
        'StorageService',
        { folder, fileName },
      );
      throw new Error(`Error al subir archivo a Supabase Storage: ${error.message}`);
    }

    const { data: publicUrlData } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(fileName);

    // Log de upload exitoso
    this.logger.log(
      `Archivo subido: ${fileName}`,
      'StorageService',
      {
        folder,
        fileName,
        size: finalBuffer.length,
        wasOptimized: isImage,
      },
    );

    return publicUrlData.publicUrl;
  }

  /**
   * Elimina un archivo de Supabase Storage por su URL pública.
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      if (!fileUrl) return;

      const urlParts = fileUrl.split(`/${this.bucket}/`);
      if (urlParts.length < 2) {
        this.logger.warn(
          'URL de archivo no válida para eliminar',
          'StorageService',
          { fileUrl },
        );
        return;
      }

      const filePath = urlParts[1];

      const { error } = await this.supabase.storage
        .from(this.bucket)
        .remove([filePath]);

      if (error) {
        this.logger.error(
          'Error al eliminar archivo de Supabase',
          error.message,
          'StorageService',
          { filePath },
        );
      } else {
        this.logger.log(
          `Archivo eliminado: ${filePath}`,
          'StorageService',
        );
      }
    } catch (err) {
      this.logger.error(
        'Error en deleteFile',
        err.message,
        'StorageService',
        { fileUrl },
      );
    }
  }
}

/**
 * Helper: elige el preset de optimización basándose en la carpeta destino.
 */
function getPresetByFolder(
  folder: string,
  override?: OptimizeOptions,
): OptimizeOptions {
  // Si el usuario pasó opciones específicas, usarlas
  if (override) return override;

  // Elegir preset por nombre de carpeta
  if (folder.includes('profile')) return IMAGE_PRESETS.avatar;
  if (folder.includes('logo')) return IMAGE_PRESETS.logo;
  if (folder.includes('banner')) return IMAGE_PRESETS.banner;
  if (folder.includes('post')) return IMAGE_PRESETS.post;

  return IMAGE_PRESETS.default;
}