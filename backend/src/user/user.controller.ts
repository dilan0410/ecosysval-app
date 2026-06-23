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
  UseGuards, //nuevo
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';

// NUEVOS IMPORTS PARA PROTECCIÓN
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // =========================
  // Helpers para uploads
  // =========================
  private ensureDir(dir: string) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }

  private imageFileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
    if (!file.mimetype.match(/^image\/(png|jpe?g|gif|webp|svg\+xml)$/)) {
      return cb(
        new BadRequestException('Solo se permiten archivos de imagen'),
        false,
      );
    }
    cb(null, true);
  };

  // =========================
  // Crear usuario (registro) - PÚBLICO (cualquiera puede registrarse)
  // =========================
  @Post()
  async create(@Body() user: any) {
    if (!user?.password) {
      return { success: false, message: 'La contraseña es obligatoria' };
    }
    const newUser = await this.userService.create(user);
    return { success: true, message: 'Usuario registrado', user: newUser };
  }

  // =========================
  // Obtener todos los usuarios - SOLO ADMIN
  // =========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  // =========================
  // Obtener un usuario por ID - SOLO AUTENTICADOS
  // =========================
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(Number(id));
  }

  // =========================
  // Actualizar usuario - SOLO AUTENTICADOS
  // =========================
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() user: any) {
    return this.userService.update(Number(id), user);
  }

  // =========================
  // Subir imagen de perfil - SOLO AUTENTICADOS
  // =========================
  @UseGuards(JwtAuthGuard)
  @Patch(':id/profile-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads', 'profile_images');
          if (!existsSync(uploadPath)) mkdirSync(uploadPath, { recursive: true });
          cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `profile_${unique}${extname(file.originalname)}`);
        },
      }),
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

    const relativePath = `/uploads/profile_images/${file.filename}`;
    const user = await this.userService.updateImages(Number(id), {
      profile_image: relativePath,
    });

    return { success: true, message: 'Imagen de perfil actualizada', user };
  }

  // =========================
  // Subir imagen de banner - SOLO AUTENTICADOS
  // =========================
  @UseGuards(JwtAuthGuard)
  @Patch(':id/banner-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads', 'banner_images');
          if (!existsSync(uploadPath)) mkdirSync(uploadPath, { recursive: true });
          cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `banner_${unique}${extname(file.originalname)}`);
        },
      }),
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

    const relativePath = `/uploads/banner_images/${file.filename}`;
    const user = await this.userService.updateImages(Number(id), {
      banner_image: relativePath,
    });

    return { success: true, message: 'Imagen de portada actualizada', user };
  }

  // =========================
  // Eliminar usuario - SOLO ADMIN
  // =========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.userService.remove(Number(id));
  }
}