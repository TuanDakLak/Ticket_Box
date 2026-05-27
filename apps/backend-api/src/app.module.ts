import { Module } from '@nestjs/common';
import { CatalogModule } from './modules/catalog/catalog.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
	imports: [CatalogModule, AuthModule],
})
export class AppModule {}
