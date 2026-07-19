// backend/src/common/storage/storage.module.ts
import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
// sharp
import { ImageOptimizerService } from './image-optimizer.service';

@Module({
  providers: [
    StorageService,
    ImageOptimizerService, // sharp
  ],
  exports: [StorageService], // Solo exportamos StorageService (el que se usa afuera)
})
export class StorageModule {}