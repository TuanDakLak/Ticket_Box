import { Module } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import { RedisService } from '../../shared/redis';
import { PaymentController } from './controllers/payment.controller';
import { OrdersController } from './controllers/orders.controller';
import { PaymentService } from './services/payment.service';
import { OrdersService } from './services/orders.service';

@Module({
    providers: [PrismaService, RedisService, PaymentService, OrdersService],
    controllers: [PaymentController, OrdersController],
    exports: [PaymentService, OrdersService],
})
export class PaymentModule { }