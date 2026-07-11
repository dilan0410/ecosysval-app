// backend/src/user/user.controller.ts
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
  ConflictException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger'; // NUEVO
import { Throttle } from '@nestjs/throttler'; // NUEVO
import { UserService } from './user.service';
import { EmpresaService } from '../empresa/empresa.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { StorageService } from '../common/storage/storage.service';
import { CreateUserDto } from './dto/create-user.dto'; // NUEVO

@ApiTags('users') // NUEVO
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly empresaService: EmpresaService,
    private readonly storageService: StorageService,
  ) {}

  // ==========================================
  // POST / — Registrar usuario + empresa
  // ==========================================
  @Post()
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // Anti-spam: 3 registros/min
  @ApiOperation({
    summary: 'Registrar nuevo usuario + empresa',
    description:
      'Crea un usuario y opcionalmente una empresa vinculada. ' +
      'Si SKIP_EMAIL_VERIFICATION=false, se enviará un email de verificación. ' +
      'Límite: 3 registros por minuto por IP.',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado. Si requiere verificación, se envió email.',
    schema: {
      example: {
        success: true,
        message: 'Usuario y empresa registrados. Revisa tu email para verificar.',
        user: {
          id: 45,
          name: 'Juan Perez',
          email: 'juan@ejemplo.com',
          email_verified: false,
          role: 'user',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Email ya registrado' })
  @ApiResponse({ status: 429, description: 'Demasiados intentos de registro' })
  async create(@Body() body: CreateUserDto) {
    const {
      name,
      email,
      password,
      razonSocial,
      representante,
      ubicacion,
      paginaWeb,
      paquete,
    } = body;

    // Verificar si el email ya existe
    const usuarioExistente = await this.userService.findByEmail(email);
    if (usuarioExistente) {
      return {
        success: false,
        message: 'Este email ya está registrado. Usa otro o inicia sesión.',
      };
    }

    // Crear usuario
    let newUser;
    try {
      newUser = await this.userService.create({ name, email, password });
    } catch (error) {
      console.error('Error creando usuario:', error.message);
      return { success: false, message: 'Error al crear el usuario' };
    }

    // Crear empresa vinculada (si viene razonSocial)
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
        // Limpiar usuario huérfano si falla la empresa
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

    // Mensaje según modo (con o sin verificación)
    const skipVerification = process.env.SKIP_EMAIL_VERIFICATION === 'true';
    const message = skipVerification
      ? 'Usuario y empresa registrados. Ya puedes iniciar sesión.'
      : 'Usuario y empresa registrados. Revisa tu email para verificar tu cuenta.';

    return {
      success: true,
      message,
      user: newUser,
    };
  }

  // ==========================================
  // GET / — Listar todos (solo ADMIN)
  // ==========================================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar todos los usuarios (solo admin)',
    description: 'Devuelve la lista completa de usuarios ordenados por ID descendente.',
  })
  @ApiResponse({ status: 200, description: 'Lista de usuarios' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Solo admins pueden acceder' })
  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  // ==========================================
  // GET /:id — Obtener un usuario
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiResponse({ status: 200, description: 'Datos del usuario' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(Number(id));
  }

  // ==========================================
  // PUT /:id — Actualizar usuario
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar datos del usuario' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() user: any) {
    return this.userService.update(Number(id), user);
  }

  // ==========================================
  // PATCH /:id/profile-image — Subir foto perfil
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Subir imagen de perfil',
    description: 'Sube una imagen a Supabase Storage. Máx 5MB. Formatos: png, jpg, gif, webp.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @Patch(':id/profile-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
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
  async uploadProfileImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo');

    const userActual = await this.userService.findOne(Number(id));
    if (userActual?.profile_image && userActual.profile_image.includes('supabase')) {
      await this.storageService.deleteFile(userActual.profile_image);
    }

    const publicUrl = await this.storageService.uploadFile(file, 'profile_images');

    const user = await this.userService.updateImages(Number(id), {
      profile_image: publicUrl,
    });

    return { success: true, message: 'Imagen de perfil actualizada', user };
  }

  // ==========================================
  // PATCH /:id/banner-image — Subir banner
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Subir imagen de banner',
    description: 'Sube una imagen a Supabase Storage. Máx 5MB.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @Patch(':id/banner-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
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

    const userActual = await this.userService.findOne(Number(id));
    if (userActual?.banner_image && userActual.banner_image.includes('supabase')) {
      await this.storageService.deleteFile(userActual.banner_image);
    }

    const publicUrl = await this.storageService.uploadFile(file, 'banner_images');

    const user = await this.userService.updateImages(Number(id), {
      banner_image: publicUrl,
    });

    return { success: true, message: 'Imagen de portada actualizada', user };
  }

  // ==========================================
  // DELETE /:id — Eliminar (solo ADMIN)
  // ==========================================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Eliminar usuario (solo admin)' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.userService.remove(Number(id));
  }
}