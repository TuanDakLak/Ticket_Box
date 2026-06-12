import { Module } from '@nestjs/common';
import { StorageGcService } from './services/storage-gc.service';
import { PrismaService } from '../../shared/prisma.service';
import { WorkerController } from './controllers/worker.controller';
import { GuestImportConsumer } from './consumers/guest-import.consumer';

@Module({
  controllers: [WorkerController],
  providers: [PrismaService, StorageGcService, GuestImportConsumer],
  exports: [StorageGcService],
})
export class WorkerModule {}
