import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Patch,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { EmpresaService } from '../empresa/empresa.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer'; // CAMBIO: memoryStorage en vez de diskStorage

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { StorageService } from '../common/storage/storage.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly empresaService: EmpresaService,
    private readonly storageService: StorageService, // NUEVO
  ) {}

  // =========================
  // Crear usuario + empresa (registro completo)
  // =========================
  @Post()
  async create(@Body() body: any) {
    if (!body?.password) {
      return { success: false, message: 'La contraseña es obligatoria' };
    }

    const {
      name,
      email,
      password,
      razonSocial,
      representante,
      ubicacion,
      paginaWeb,
      paquete,
      ...resto
    } = body;

    const usuarioExistente = await this.userService.findByEmail(email);
    if (usuarioExistente) {
      return {
        success: false,
        message: 'Este email ya está registrado. Usa otro o inicia sesión.',
      };
    }

    let newUser;
    try {
      newUser = await this.userService.create({ name, email, password });
    } catch (error) {
      console.error('Error creando usuario:', error.message);
      return { success: false, message: 'Error al crear el usuario' };
    }

    if (razonSocial) {
      try {
        await this.empresaService.crear({
          razonSocial,
          correo: email,
          representante,
          ubicacion,
          paginaWeb,
          paquete: paquete || 'basico',
          userId: newUser.id,
        });
      } catch (error) {
        console.error('Error creando empresa:', error.message);
        try {
          await this.userService.remove(newUser.id);
        } catch (e) {
          console.error('Error al limpiar usuario:', e.message);
        }
        return {
          success: false,
          message: 'Error al crear la empresa. Inténtalo de nuevo.',
        };
      }
    }

    return {
      success: true,
      message: 'Usuario y empresa registrados',
      user: newUser,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() user: any) {
    return this.userService.update(Number(id), user);
  }

  // =========================
  // MIGRADO: Subir imagen de perfil a Supabase
  // =========================
  @UseGuards(JwtAuthGuard)
  @Patch(':id/profile-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // En memoria, para pasar a Supabase
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/^image\/(png|jpe?g|gif|webp|svg\+xml)$/)) {
          return cb(
            new BadRequestException('Solo se permiten archivos de imagen'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    }),
  )
  async uploadProfileImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo');

    // Eliminar imagen anterior de Supabase (si existía)
    const userActual = await this.userService.findOne(Number(id));
    if (userActual?.profile_image && userActual.profile_image.includes('supabase')) {
      await this.storageService.deleteFile(userActual.profile_image);
    }

    // Subir a Supabase
    const publicUrl = await this.storageService.uploadFile(file, 'profile_images');

    const user = await this.userService.updateImages(Number(id), {
      profile_image: publicUrl,
    });

    return { success: true, message: 'Imagen de perfil actualizada', user };
  }

  // =========================
  // MIGRADO: Subir imagen de banner a Supabase
  // =========================
  @UseGuards(JwtAuthGuard)
  @Patch(':id/banner-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // En memoria
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/^image\/(png|jpe?g|gif|webp|svg\+xml)$/)) {
          return cb(
            new BadRequestException('Solo se permiten archivos de imagen'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadBannerImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo');

    // Eliminar banner anterior de Supabase (si existía)
    const userActual = await this.userService.findOne(Number(id));
    if (userActual?.banner_image && userActual.banner_image.includes('supabase')) {
      await this.storageService.deleteFile(userActual.banner_image);
    }

    // Subir a Supabase
    const publicUrl = await this.storageService.uploadFile(file, 'banner_images');

    const user = await this.userService.updateImages(Number(id), {
      banner_image: publicUrl,
    });

    return { success: true, message: 'Imagen de portada actualizada', user };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.userService.remove(Number(id));
  }
}