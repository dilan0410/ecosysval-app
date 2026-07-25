// backend/src/resena/resena.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resena } from './resena.entity';
import { Empresa } from '../empresa/empresa.entity';
import { ResenaService } from './resena.service';
import { ResenaController } from './resena.controller';

@Module({
  imports: [
    // Registramos AMBAS entidades porque el service las usa
    TypeOrmModule.forFeature([Resena, Empresa]),
  ],
  providers: [ResenaService],
  controllers: [ResenaController],
  exports: [ResenaService], // Por si otro módulo lo necesita después
})
export class ResenaModule {}