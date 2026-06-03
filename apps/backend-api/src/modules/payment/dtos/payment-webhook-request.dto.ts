import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsString } from 'class-validator';

export enum PaymentWebhookOutcome {
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
}

export class PaymentWebhookRequestDto {
    @ApiProperty()
    @IsString()
    code!: string;

    @ApiProperty()
    @IsString()
    desc!: string;

    @ApiProperty()
    @IsBoolean()
    success!: boolean;

    @ApiProperty()
    @IsObject()
    data!: Record<string, any>;

    @ApiProperty()
    @IsString()
    signature!: string;
}