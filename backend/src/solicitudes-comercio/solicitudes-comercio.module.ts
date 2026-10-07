// backend/src/solicitudes-comercio/solicitudes-comercio.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudesComercioController } from './solicitudes-comercio.controller';
import { SolicitudesComercioService } from './solicitudes-comercio.service';
import { SolicitudComercio } from './solicitud-comercio.entity';
import { Empresa } from '../empresa/empresa.entity';
import { NotificacionModule } from '../notificacion/notificacion.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SolicitudComercio, Empresa]),
    NotificacionModule,
  ],
  controllers: [SolicitudesComercioController],
  providers: [SolicitudesComercioService],
  exports: [SolicitudesComercioService],
})
export class SolicitudesComercioModule {}