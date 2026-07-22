// backend/src/admin/admin.controller.ts
/**
 * ADMIN CONTROLLER
 * -------------------------------------------------------
 * Endpoints REST para el panel administrativo de Ecosysval.
 *
 * TODOS los endpoints están protegidos con:
 * - JwtAuthGuard   → Requiere token JWT válido
 * - RolesGuard     → Requiere rol 'admin'
 *
 * Endpoints disponibles:
 * - GET /admin/stats/overview   → KPIs generales
 * - GET /admin/stats/usuarios   → Usuarios por mes
 * - GET /admin/stats/empresas   → Distribución empresas
 */

import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { AdminStatsService } from './admin-stats.service';

@ApiTags('admin')
@ApiBearerAuth('JWT-auth') // Aparece candado en Swagger
@UseGuards(JwtAuthGuard, RolesGuard) // Protección a nivel controller
@Roles('admin') // Solo admins pueden acceder a TODOS los endpoints de aquí
@Controller('admin')
export class AdminController {
  constructor(private readonly statsService: AdminStatsService) {}

  // ==========================================
  // GET /admin/stats/overview
  // ==========================================
  @Get('stats/overview')
  @ApiOperation({
    summary: 'KPIs generales del sistema',
    description:
      'Retorna los contadores principales de la plataforma: ' +
      'usuarios, empresas, empleos, verificaciones, etc. ' +
      'Ideal para las cards del dashboard.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas calculadas correctamente',
    schema: {
      example: {
        totalUsuarios: 47,
        totalEmpresas: 22,
        totalEmpleos: 15,
        totalAdmins: 2,
        usuariosVerificados: 38,
        usuariosPendientes: 9,
        tasaVerificacion: 81,
        usuariosNuevosEsteMes: 12,
        empresasNuevasEsteMes: 5,
        empleosActivos: 12,
        empleosCerrados: 3,
        calculadoEn: '2026-07-19T18:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Requiere rol de admin' })
  async getOverview() {
    return this.statsService.getOverview();
  }

  // ==========================================
  // GET /admin/stats/usuarios
  // ==========================================
  @Get('stats/usuarios')
  @ApiOperation({
    summary: 'Tendencia de usuarios registrados',
    description:
      'Retorna la cantidad de usuarios agrupados por mes ' +
      '(últimos 6 meses). Formato listo para Recharts.',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos de tendencia calculados',
    schema: {
      example: {
        labels: ['Feb 2026', 'Mar 2026', 'Abr 2026', 'May 2026', 'Jun 2026', 'Jul 2026'],
        data: [3, 7, 12, 8, 15, 12],
        total: 57,
        promedio: 9,
        periodo: '6 meses',
        calculadoEn: '2026-07-19T18:30:00.000Z',
      },
    },
  })
  async getUsuariosPorMes() {
    return this.statsService.getUsuariosPorMes();
  }

  // ==========================================
  // GET /admin/stats/empresas
  // ==========================================
  @Get('stats/empresas')
  @ApiOperation({
    summary: 'Estadísticas y distribución de empresas',
    description:
      'Retorna análisis completo de empresas: ' +
      'distribución por estado, paquete, ámbito, ' +
      'indicadores clave y porcentajes útiles.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de empresas calculadas',
    schema: {
      example: {
        total: 22,
        porEstado: {
          labels: ['CDMX', 'Jalisco', 'Nuevo León'],
          data: [10, 7, 5],
        },
        porPaquete: {
          labels: ['basico', 'pro', 'premium', 'platino'],
          data: [12, 6, 3, 1],
        },
        porAmbito: {
          labels: ['Financiero', 'Social', 'Medio ambiental'],
          data: [10, 8, 4],
        },
        indicadores: {
          conSucursales: 8,
          sinSucursales: 14,
          conSocios: 12,
          conLogo: 18,
          conOperacionesInt: 5,
          perfilCompleto: 18,
        },
        porcentajes: {
          tasaPerfilCompleto: 82,
          tasaSucursales: 36,
          tasaInternacional: 23,
        },
        calculadoEn: '2026-07-19T18:30:00.000Z',
      },
    },
  })
  async getEmpresasStats() {
    return this.statsService.getEmpresasStats();
  }
}