import { Module } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import { RedisModule } from '../../shared/redis/redis.module';
import { PaymentController } from './controllers/payment.controller';
import { OrdersController } from './controllers/orders.controller';
import { PaymentService } from './services/payment.service';
import { OrdersService } from './services/orders.service';
import { RolesGuard } from '../../shared/guards/roles.guard';

@Module({
    imports: [RedisModule],
    providers: [PrismaService, PaymentService, OrdersService, RolesGuard],
    controllers: [PaymentController, OrdersController],
    exports: [PaymentService, OrdersService],
})
export class PaymentModule { }