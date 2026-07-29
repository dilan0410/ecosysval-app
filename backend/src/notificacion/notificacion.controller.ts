// backend/src/notificacion/notificacion.controller.ts
import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Req,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificacionService } from './notificacion.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('notificaciones')
@Controller('notificaciones')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class NotificacionController {
  constructor(private readonly notifService: NotificacionService) {}

  // ==========================================
  // GET /notificaciones — Listar mis notificaciones
  // ==========================================
  @Get()
  @ApiOperation({
    summary: 'Listar mis notificaciones',
    description: 'Devuelve las notificaciones del usuario con paginación y contador de no leídas.',
  })
  @ApiResponse({ status: 200, description: 'Lista de notificaciones' })
  async obtenerMias(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.id;
    return this.notifService.obtenerMias(userId, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  // ==========================================
  // GET /notificaciones/count — Solo el contador
  // Endpoint ligero para el badge del header
  // ==========================================
  @Get('count')
  @ApiOperation({
    summary: 'Contar notificaciones no leídas',
    description: 'Endpoint ligero para el badge del header. Solo devuelve un número.',
  })
  @ApiResponse({ status: 200, description: 'Contador de no leídas' })
  async contarNoLeidas(@Req() req: any) {
    const userId = req.user.id;
    return this.notifService.contarNoLeidas(userId);
  }

  // ==========================================
  // PATCH /notificaciones/:id/leer — Marcar como leída
  // ==========================================
  @Patch(':id/leer')
  @ApiOperation({ summary: 'Marcar una notificación como leída' })
  @ApiResponse({ status: 200, description: 'Notificación marcada' })
  @ApiResponse({ status: 403, description: 'Sin permiso' })
  @ApiResponse({ status: 404, description: 'No encontrada' })
  async marcarLeida(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.notifService.marcarLeida(id, userId);
  }

  // ==========================================
  // PATCH /notificaciones/leer-todas — Marcar TODAS
  // ==========================================
  @Patch('leer-todas')
  @ApiOperation({ summary: 'Marcar todas las notificaciones como leídas' })
  @ApiResponse({ status: 200, description: 'Notificaciones marcadas' })
  async marcarTodasLeidas(@Req() req: any) {
    const userId = req.user.id;
    return this.notifService.marcarTodasLeidas(userId);
  }

  // ==========================================
  // DELETE /notificaciones/:id — Eliminar una
  // ==========================================
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una notificación' })
  @ApiResponse({ status: 200, description: 'Notificación eliminada' })
  async eliminar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.notifService.eliminar(id, userId);
  }

  // ==========================================
  // DELETE /notificaciones/leidas — Eliminar todas las leídas
  // ==========================================
  @Delete('leidas/todas')
  @ApiOperation({ summary: 'Eliminar todas las notificaciones leídas' })
  @ApiResponse({ status: 200, description: 'Notificaciones eliminadas' })
  async eliminarLeidas(@Req() req: any) {
    const userId = req.user.id;
    return this.notifService.eliminarTodasLeidas(userId);
  }
}