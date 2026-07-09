import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Req,
  Param,
  ParseIntPipe,
  NotFoundException,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer'; // CAMBIO: memoryStorage en vez de diskStorage

import { EmpresaService } from './empresa.service';
import { EmpresaReportService } from './empresa.report.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { StorageService } from '../common/storage/storage.service';

@Controller('empresas')
export class EmpresaController {
  constructor(
    private readonly empresaService: EmpresaService,
    private readonly storageService: StorageService,
    private readonly empresaReportService: EmpresaReportService,
  ) {}

  // ==========================================
  // POST / — Crear empresa (con logo opcional en Supabase)
  // ==========================================
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // En memoria, para pasarlo a Supabase
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB máx
    }),
  )
  async crear(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const empresaData = { ...body };

    // Si viene archivo, lo subimos a Supabase Storage
    if (file) {
      const logoUrl = await this.storageService.uploadFile(file, 'logos');
      empresaData.logo = logoUrl;
    }

    return this.empresaService.crear(empresaData);
  }

  // ==========================================
  // GET /mi-empresa — Empresa del usuario logueado
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Get('mi-empresa')
  async miEmpresa(@Req() req: any) {
    const userId = req.user.id;
    const empresa = await this.empresaService.obtenerPorUserId(userId);

    if (!empresa) {
      throw new NotFoundException('No tienes empresa registrada');
    }

    return empresa;
  }

  // ==========================================
  // GET / — Listar todas
  // ==========================================
  @Get()
  obtenerTodas() {
    return this.empresaService.obtenerTodas();
  }

  // ==========================================
  // GET /:id — Obtener una empresa
  // ==========================================
  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.empresaService.obtenerPorId(id);
  }

  // ==========================================
  // PUT /:id — Actualizar (login requerido)
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.empresaService.actualizar(id, body);
  }

  // ==========================================
  // DELETE /:id — Solo ADMIN
  // ==========================================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.empresaService.eliminar(id);
  }

  // ==========================================
  // PATCH /:id/logo — Subir/cambiar logo (Supabase)
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Patch(':id/logo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // En memoria
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB máx
    }),
  )
  async uploadLogo(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se recibió archivo de logo');
    }

    // Opcional: eliminar el logo anterior de Supabase (si existía)
    const empresaActual = await this.empresaService.obtenerPorId(id);
    if (empresaActual?.logo && empresaActual.logo.includes('supabase')) {
      await this.storageService.deleteFile(empresaActual.logo);
    }

    // Subimos el nuevo logo a Supabase
    const logoUrl = await this.storageService.uploadFile(file, 'logos');
    const empresa = await this.empresaService.actualizar(id, { logo: logoUrl });

    return {
      success: true,
      logo: logoUrl,
      empresa,
    };
  }

  // ==========================================
  // PATCH /:id/banner — Subir/cambiar banner de empresa
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Patch(':id/banner')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB (banners suelen ser más grandes)
    }),
  )
  async uploadBanner(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se recibió archivo de banner');
    }

    // Eliminar banner anterior de Supabase (si existía)
    const empresaActual = await this.empresaService.obtenerPorId(id);
    if (empresaActual?.banner && empresaActual.banner.includes('supabase')) {
      await this.storageService.deleteFile(empresaActual.banner);
    }

    // Subir nuevo banner a Supabase
    const bannerUrl = await this.storageService.uploadFile(file, 'banners');
    const empresa = await this.empresaService.actualizar(id, { banner: bannerUrl });

    return {
      success: true,
      banner: bannerUrl,
      empresa,
    };
  }

  // ==========================================
  // GET /:id/reporte — Generar PDF
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Get(':id/reporte')
  async generarReporte(@Param('id', ParseIntPipe) id: number) {
    const empresa = await this.empresaService.obtenerPorId(id);
    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    const url = await this.empresaReportService.generarPDF(empresa);
    return {
      success: true,
      url,
    };
  }
}