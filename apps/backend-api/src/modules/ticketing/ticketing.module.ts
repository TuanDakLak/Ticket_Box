import { Module } from '@nestjs/common';
import { RedisModule } from '../../shared/redis/redis.module';
import { PrismaService } from '../../shared/prisma.service';
import { TicketingController } from './controllers/ticketing.controller';
import { TicketingService } from './services/ticketing.service';

@Module({
    imports: [RedisModule],
    controllers: [TicketingController],
    providers: [TicketingService, PrismaService],
    exports: [TicketingService],
})
export class TicketingModule { }