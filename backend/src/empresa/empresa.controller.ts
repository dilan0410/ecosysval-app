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
  UseGuards, // NUEVO
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { EmpresaService } from './empresa.service';
import { EmpresaReportService } from './empresa.report.service';

// NUEVOS IMPORTS PARA PROTECCIÓN
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';

@Controller('empresas')
export class EmpresaController {
  constructor(
    private readonly empresaService: EmpresaService,
    private readonly empresaReportService: EmpresaReportService,
  ) {}

  // PÚBLICO: Cualquiera puede registrar una empresa
  @Post()
  crear(@Body() body: any) {
    return this.empresaService.crear(body);
  }

  // Obtener la empresa del usuario logueado
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

  // PÚBLICO: Cualquiera puede ver la lista de empresas
  @Get()
  obtenerTodas() {
    return this.empresaService.obtenerTodas();
  }

  // PÚBLICO: Cualquiera puede ver una empresa específica
  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.empresaService.obtenerPorId(id);
  }

  // AUTENTICADOS: Editar requiere login
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.empresaService.actualizar(id, body);
  }

  // SOLO ADMIN: Eliminar empresas
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.empresaService.eliminar(id);
  }

  // AUTENTICADOS: Subir logo
  @UseGuards(JwtAuthGuard)
  @Patch(':id/logo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/logos',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async uploadLogo(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      return {
        success: false,
        message: 'No se recibió archivo de logo',
      };
    }

    const logoPath = `/uploads/logos/${file.filename}`;
    const empresa = await this.empresaService.actualizar(id, { logo: logoPath });

    return {
      success: true,
      logo: logoPath,
      empresa,
    };
  }

  // AUTENTICADOS: Generar PDF
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