// backend/src/solicitudes-comercio/solicitudes-comercio.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SolicitudesComercioService } from './solicitudes-comercio.service';

@ApiTags('solicitudes-comercio')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('solicitudes-comercio')
export class SolicitudesComercioController {
  constructor(private readonly service: SolicitudesComercioService) {}

  @Post()
  @ApiOperation({ summary: 'Crear solicitud de comercio' })
  async crear(@Body() body: any, @Request() req: any) {
    const userId = req.user.id;
    const data = {
      ...body,
      empresaEmisoraId: body.empresaEmisoraId || userId,
      empresaDestinoId: body.empresaDestinoId,
    };
    return this.service.crearSolicitud(data);
  }

  @Get('mis-solicitudes')
  @ApiOperation({ summary: 'Obtener mis solicitudes' })
  async obtenerMisSolicitudes(@Request() req: any) {
    const userId = req.user.id;
    return this.service.obtenerPorEmpresa(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener solicitud por ID' })
  async obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.service.obtenerPorId(id);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Actualizar estado de solicitud' })
  async actualizarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: string },
  ) {
    return this.service.actualizarEstado(id, body.status);
  }
}