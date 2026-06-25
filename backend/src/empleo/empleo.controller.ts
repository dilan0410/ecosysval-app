import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards, // NUEVO
} from "@nestjs/common";
import { EmpleoService } from "./empleo.service";
import { CreateEmpleoDto } from "./dto/create-empleo.dto";
import { UpdateEmpleoDto } from "./dto/update-empleo.dto";

// NUEVOS IMPORTS PARA PROTECCIÓN
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';

@Controller("empleos")
export class EmpleoController {
  constructor(private readonly empleoService: EmpleoService) {}

  // AUTENTICADOS: Crear empleo
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateEmpleoDto) {
    return this.empleoService.create(dto);
  }

  // PÚBLICO: Ver lista de empleos
  @Get()
  findAll() {
    return this.empleoService.findAll();
  }

  // PÚBLICO: Ver un empleo específico
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.empleoService.findOne(Number(id));
  }

  // AUTENTICADOS: Actualizar empleo
  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateEmpleoDto) {
    return this.empleoService.update(Number(id), dto);
  }

  // SOLO ADMIN: Eliminar empleo
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.empleoService.remove(Number(id));
  }

  // AUTENTICADOS: Cerrar empleo
  @UseGuards(JwtAuthGuard)
  @Patch(":id/cerrar")
  cerrar(@Param("id") id: string) {
    return this.empleoService.cerrar(Number(id));
  }

    // AUTENTICADOS: Reabrir empleo
  @UseGuards(JwtAuthGuard)
  @Patch(":id/reabrir")
  reabrir(@Param("id") id: string) {
    return this.empleoService.reabrir(Number(id));
  }
}