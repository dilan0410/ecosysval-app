// backend/src/mensaje/mensaje.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MensajeService } from './mensaje.service';
import { CreateConversacionDto, CreateMensajeDto } from './dto/create-mensaje.dto';
import { MensajeGateway } from './mensaje.gateway';

@ApiTags('mensajes')
@Controller('mensajes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MensajeController {
  constructor(
    private readonly mensajeService: MensajeService,
    private readonly mensajeGateway: MensajeGateway,
  ) {}

  @Get('conversaciones')
  @ApiOperation({ summary: 'Listar mis conversaciones' })
  async listarConversaciones(@Req() req: any) {
    return this.mensajeService.listarConversaciones(req.user.id);
  }

  @Get('no-leidos')
  @ApiOperation({ summary: 'Contador global de mensajes no leídos' })
  async noLeidos(@Req() req: any) {
    return this.mensajeService.contarNoLeidos(req.user.id);
  }

  @Post('conversaciones')
  @ApiOperation({ summary: 'Crear o abrir conversación 1-1' })
  async crearConversacion(@Req() req: any, @Body() dto: CreateConversacionDto) {
    const result = await this.mensajeService.obtenerOCrearConversacion(
      req.user.id,
      dto.participanteId,
      dto.mensajeInicial,
    );

    if (result.mensaje) {
      this.mensajeGateway.emitirNuevoMensaje(result.mensaje, result.conversacion.id);
    }

    return result;
  }

  @Get('conversaciones/:id')
  @ApiOperation({ summary: 'Detalle de una conversación' })
  async obtenerConversacion(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.mensajeService.obtenerConversacion(id, req.user.id);
  }

  @Get('conversaciones/:id/mensajes')
  @ApiOperation({ summary: 'Listar mensajes de una conversación' })
  async listarMensajes(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.mensajeService.listarMensajes(id, req.user.id, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  @Post('conversaciones/:id/mensajes')
  @ApiOperation({ summary: 'Enviar mensaje REST' })
  async enviarMensaje(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() dto: CreateMensajeDto,
  ) {
    const mensaje = await this.mensajeService.enviarMensaje(id, req.user.id, dto.contenido);
    this.mensajeGateway.emitirNuevoMensaje(mensaje, id);
    return mensaje;
  }

  // nuevo: Eliminar mensaje (para todos, sin rastro)
  // delete /mensajes/conversaciones/:id/mensajes/:msgId

  @Delete('conversaciones/:id/mensajes/:msgId')
  @ApiOperation({
    summary: 'Eliminar mensaje para todos',
    description:
      'Solo el autor puede borrar. Se elimina de BD sin dejar placeholder tipo "mensaje eliminado".',
  })
  async eliminarMensaje(
    @Param('id', ParseIntPipe) id: number,
    @Param('msgId', ParseIntPipe) msgId: number,
    @Req() req: any,
  ) {
    const result = await this.mensajeService.eliminarMensaje(id, msgId, req.user.id);
    this.mensajeGateway.emitirMensajeEliminado(id, msgId);
    return result;
  }

  @Patch('conversaciones/:id/leer')
  @ApiOperation({ summary: 'Marcar mensajes de la conversación como leídos' })
  async marcarLeidos(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const result = await this.mensajeService.marcarLeidos(id, req.user.id);
    this.mensajeGateway.emitirLeidos(id, req.user.id, result.marcados);
    return result;
  }
}