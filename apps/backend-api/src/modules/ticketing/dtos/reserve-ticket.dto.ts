import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Min } from 'class-validator';

export class ReserveTicketDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID of the concert' })
    @IsUUID()
    concert_id!: string;

    @ApiProperty({ example: 'f6c2a9c4-0e88-4b7c-8b9d-2e93c1c5c1b1', description: 'ID of the ticket category' })
    @IsUUID()
    category_id!: string;

    @ApiProperty({ example: 2, minimum: 1, description: 'Number of tickets to reserve' })
    @IsInt()
    @Min(1)
    quantity!: number;
}

export class InitCategoryDto {
    @ApiProperty({ example: 'f6c2a9c4-0e88-4b7c-8b9d-2e93c1c5c1b1', description: 'ID of the ticket category' })
    @IsUUID()
    category_id!: string;

    @ApiProperty({ example: 10, minimum: 0, description: 'Number of available tickets' })
    @IsInt()
    @Min(0)
    available!: number;

    @ApiProperty({ example: 4, minimum: 1, description: 'Max tickets per user' })
    @IsInt()
    @Min(1)
    max_per_user!: number;
}
