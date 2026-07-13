// backend/src/post/post.controller.ts
import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { PostService } from './post.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer'; // CAMBIO: memoryStorage
import { StorageService } from '../common/storage/storage.service'; // NUEVO
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly storageService: StorageService, // NUEVO
  ) {}

  // ==========================================
  // POST / — Crear publicación con archivos
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 posts por minuto
  @ApiOperation({
    summary: 'Crear una nueva publicación',
    description:
      'Crea una publicación con texto, imagen y/o video. Los archivos se suben a Supabase Storage. ' +
      'Límite: 10 publicaciones por minuto.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Publicación creada correctamente' })
  @ApiResponse({ status: 400, description: 'Datos o archivos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @UseInterceptors(
    FilesInterceptor('files', 2, {
      storage: memoryStorage(), // CAMBIO: en memoria (para Supabase)
      limits: {
        fileSize: 50 * 1024 * 1024, // 50 MB máx (para videos)
      },
      fileFilter: (_req, file, cb) => {
        // Validar tipos permitidos
        if (
          !file.mimetype.match(/^image\/(png|jpe?g|gif|webp)$/) &&
          !file.mimetype.match(/^video\/(mp4|webm|ogg|quicktime)$/)
        ) {
          return cb(
            new BadRequestException(
              'Solo se permiten imágenes (png, jpg, gif, webp) o videos (mp4, webm, mov)',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async createPost(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { userId: number; content: string },
  ) {
    let imageUrl: string | null = null;
    let videoUrl: string | null = null;

    // NUEVO: Subir cada archivo a Supabase según su tipo
    if (files && files.length > 0) {
      for (const file of files) {
        if (file.mimetype.startsWith('image/')) {
          imageUrl = await this.storageService.uploadFile(file, 'posts');
        } else if (file.mimetype.startsWith('video/')) {
          videoUrl = await this.storageService.uploadFile(file, 'posts');
        }
      }
    }

    return this.postService.createPost(
      body.userId,
      body.content,
      imageUrl,
      videoUrl,
    );
  }

  // ==========================================
  // GET /user/:userId — Posts de un usuario
  // ==========================================
  @Get('user/:userId')
  @ApiOperation({ summary: 'Obtener publicaciones de un usuario específico' })
  @ApiResponse({ status: 200, description: 'Lista de publicaciones' })
  async getUserPosts(@Param('userId') userId: number) {
    return this.postService.getUserPosts(userId);
  }

  // ==========================================
  // GET / — Feed general
  // ==========================================
  @Get()
  @ApiOperation({ summary: 'Obtener todas las publicaciones (feed)' })
  @ApiResponse({ status: 200, description: 'Feed de publicaciones' })
  async getFeed() {
    return this.postService.getFeed();
  }

  // ==========================================
  // PATCH /:id — Editar contenido
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Patch(':id')
  @ApiOperation({ summary: 'Editar el contenido de texto de una publicación' })
  async editPost(
    @Param('id') id: number,
    @Body() body: { content: string },
  ) {
    return this.postService.editPost(id, body.content);
  }

  // ==========================================
  // DELETE /:id — Eliminar publicación
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar una publicación',
    description:
      'Elimina la publicación y sus archivos asociados en Supabase Storage.',
  })
  async deletePost(@Param('id') id: number) {
    return this.postService.deletePost(id);
  }
}