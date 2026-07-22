// backend/src/admin/admin.module.ts
/**
 * ADMIN MODULE
 * -------------------------------------------------------
 * Módulo del panel administrativo.
 *
 * Registra:
 * - AdminController (endpoints REST)
 * - AdminStatsService (lógica de estadísticas)
 *
 * Importa:
 * - TypeOrmModule.forFeature([User, Empresa, Empleo])
 *   → Para poder inyectar los repositories en el service
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminStatsService } from './admin-stats.service';

// Entidades que el service necesita consultar
import { User } from '../user/user.entity';
import { Empresa } from '../empresa/empresa.entity';
import { Empleo } from '../empleo/empleo.entity';

@Module({
  imports: [
    // Registra los 3 repositorios que usa AdminStatsService
    TypeOrmModule.forFeature([User, Empresa, Empleo]),
  ],
  controllers: [AdminController],
  providers: [AdminStatsService],
  exports: [AdminStatsService], // Por si otros módulos lo necesitan luego
})
export class AdminModule {}