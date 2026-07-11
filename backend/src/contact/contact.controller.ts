// backend/src/contact/contact.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CapacitacionDto } from './dto/capacitacion.dto';
import { ContactService } from './contact.service';

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('capacitaciones')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 solicitudes por minuto (anti-spam)
  @ApiOperation({
    summary: 'Crear solicitud de capacitación',
    description:
      'Registra una nueva solicitud de capacitación y envía un correo al equipo. ' +
      'Límite: 5 solicitudes por minuto para prevenir spam.',
  })
  @ApiResponse({
    status: 201,
    description: 'Solicitud creada y correo enviado correctamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 429, description: 'Demasiadas solicitudes' })
  @ApiResponse({ status: 500, description: 'Error al enviar el correo' })
  crear(@Body() body: CapacitacionDto) {
    return this.contactService.crearSolicitud(body);
  }
}