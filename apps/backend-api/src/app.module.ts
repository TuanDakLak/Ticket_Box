import { Module } from '@nestjs/common';
import { CatalogModule } from './modules/catalog/catalog.module';
import { AuthModule } from './modules/auth/auth.module';
import { PaymentModule } from './modules/payment/payment.module';

@Module({
	imports: [CatalogModule, AuthModule, PaymentModule],
})
export class AppModule { }
