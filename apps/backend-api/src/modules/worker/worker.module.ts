import { Module } from '@nestjs/common';
import { StorageGcService } from './services/storage-gc.service';
import { PrismaService } from '../../shared/prisma.service';

@Module({
  providers: [PrismaService, StorageGcService],
  exports: [StorageGcService],
})
export class WorkerModule {}
