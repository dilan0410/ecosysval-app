// backend/src/resena/resena.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resena } from './resena.entity';
import { Empresa } from '../empresa/empresa.entity';
import { ResenaService } from './resena.service';
import { ResenaController } from './resena.controller';
import { NotificacionModule } from '../notificacion/notificacion.module'; // NUEVO

@Module({
  imports: [
    TypeOrmModule.forFeature([Resena, Empresa]),
    NotificacionModule, // NUEVO: Para poder crear notificaciones
  ],
  providers: [ResenaService],
  controllers: [ResenaController],
  exports: [ResenaService],
})
export class ResenaModule {}