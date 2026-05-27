import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { PrismaService } from '../../shared/prisma.service';
import { EmailService } from '../../shared/email.service';

@Module({
  controllers: [AuthController],
  providers: [PrismaService, AuthService, EmailService],
  exports: [AuthService],
})
export class AuthModule {}
