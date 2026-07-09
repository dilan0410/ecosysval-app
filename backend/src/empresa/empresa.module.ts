import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from './empresa.entity';
import { EmpresaService } from './empresa.service';
import { EmpresaController } from './empresa.controller';
import { EmpresaReportService } from './empresa.report.service';
import { StorageModule } from '../common/storage/storage.module';

@Module({
  imports: [StorageModule, TypeOrmModule.forFeature([Empresa])],
  providers: [EmpresaService, EmpresaReportService],
  controllers: [EmpresaController],
  exports: [EmpresaService],
})
export class EmpresaModule {}