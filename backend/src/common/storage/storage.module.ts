import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';

@Module({
  providers: [StorageService],
  exports: [StorageService], // Crucial para que otros módulos lo importen
})
export class StorageModule {}