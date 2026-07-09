import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService implements OnModuleInit {
  private supabase: SupabaseClient;
  private bucket: string;

  onModuleInit() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    this.bucket = process.env.SUPABASE_BUCKET || 'ecosysval-media';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Faltan las variables de entorno de Supabase en el Backend.');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    if (!file) {
      throw new Error('No se ha proporcionado ningún archivo para subir.');
    }

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.floor(Math.random() * 10000)}.${fileExt}`;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new Error(`Error al subir archivo a Supabase Storage: ${error.message}`);
    }

    const { data: publicUrlData } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      if (!fileUrl) return;

      const urlParts = fileUrl.split(`/${this.bucket}/`);
      if (urlParts.length < 2) {
        console.warn('URL de archivo no válida para eliminar:', fileUrl);
        return;
      }

      const filePath = urlParts[1];

      const { error } = await this.supabase.storage
        .from(this.bucket)
        .remove([filePath]);

      if (error) {
        console.error(`Error al eliminar archivo de Supabase: ${error.message}`);
      }
    } catch (err) {
      console.error('Error en deleteFile:', err);
    }
  }
}
