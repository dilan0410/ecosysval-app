// backend/src/resena/resena.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ResenaService } from './resena.service';
import { CreateResenaDto } from './dto/create-resena.dto';
import { UpdateResenaDto } from './dto/update-resena.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('resenas')
export class ResenaController {
  constructor(private readonly resenaService: ResenaService) {}

  // ==========================================
  // GET /resenas/empresa/:id — PÚBLICO
  // Lista todas las reseñas de una empresa + estadísticas
  // ==========================================
  @Get('empresa/:id')
  async obtenerPorEmpresa(@Param('id', ParseIntPipe) empresaId: number) {
    return this.resenaService.obtenerPorEmpresa(empresaId);
  }

  // ==========================================
  // GET /resenas/mias — Requiere login
  // Lista todas las reseñas que YO he escrito
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Get('mias')
  async obtenerMias(@Req() req: any) {
    const userId = req.user.id;
    return this.resenaService.obtenerMias(userId);
  }

  // ==========================================
  // POST /resenas — Requiere login
  // Crear una nueva reseña
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Post()
  async crear(@Body() dto: CreateResenaDto, @Req() req: any) {
    const userId = req.user.id;
    return this.resenaService.crear(dto, userId);
  }

  // ==========================================
  // PUT /resenas/:id — Requiere login
  // Editar mi reseña (solo el autor)
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateResenaDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.resenaService.actualizar(id, dto, userId);
  }

  // ==========================================
  // DELETE /resenas/:id — Requiere login
  // Eliminar reseña (autor o admin)
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async eliminar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    const role = req.user.role || 'user';
    return this.resenaService.eliminar(id, userId, role);
  }
}