import { Module } from '@nestjs/common';
import { CatalogModule } from './modules/catalog/catalog.module';
import { AuthModule } from './modules/auth/auth.module';
import { PaymentModule } from './modules/payment/payment.module';
import { RedisModule } from './shared/redis/redis.module';
import { RabbitMqModule } from './shared/rabbitmq';
import { TicketingModule } from './modules/ticketing/ticketing.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
	imports: [RedisModule, RabbitMqModule, CatalogModule, AuthModule, PaymentModule, TicketingModule, UploadModule],
})
export class AppModule { }
