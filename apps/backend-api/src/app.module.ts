import { Module } from '@nestjs/common';
import { CatalogModule } from './modules/catalog/catalog.module';
import { AuthModule } from './modules/auth/auth.module';
import { PaymentModule } from './modules/payment/payment.module';
import { RedisModule } from './shared/redis/redis.module';
import { TicketingModule } from './modules/ticketing/ticketing.module';

@Module({
	imports: [RedisModule, CatalogModule, AuthModule, PaymentModule, TicketingModule],
})
export class AppModule { }
