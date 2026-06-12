import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiPropertyOptional,
  ApiTags,
} from '@nestjs/swagger';
// @ts-expect-error - multer type declarations are not installed in devDependencies
import * as multer from 'multer';
const { diskStorage } = multer;
import * as path from 'path';
import * as fs from 'fs';
import { randomUUID } from 'crypto';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { PrismaService } from '../../../shared/prisma.service';
import { RabbitMqService } from '../../../shared/rabbitmq';
import { IsUUID, IsNotEmpty, IsOptional, IsString, IsBoolean, isUUID } from 'class-validator';
import { PaginationDto } from '../../../shared/dtos/pagination.dto';
import { Transform } from 'class-transformer';

export class ImportCsvDto {
  @IsUUID()
  @IsNotEmpty()
  concert_id!: string;
}

export class GuestListQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'VIP', description: 'Filter by ticket category (case-insensitive)' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'An', description: 'Search by guest email or full name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: false, description: 'Filter by scan status' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  is_scanned?: boolean;
}

const uploadDir = path.join(process.cwd(), 'apps/backend-api/tmp/csv-uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

@ApiTags('Worker')
@Controller('worker')
export class WorkerController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rabbitMqService: RabbitMqService,
  ) {}

  @Post('import-csv')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ORGANIZER')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Asynchronously import guest list from CSV (Admin/Organizer)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        concert_id: {
          type: 'string',
          format: 'uuid',
          description: 'The UUID of the concert to import guest list into',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSV file containing guest list (columns: email, full_name, ticket_category)',
        },
      },
      required: ['concert_id', 'file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          cb(null, uploadDir);
        },
        filename: (req: any, file: any, cb: any) => {
          const fileExt = path.extname(file.originalname).toLowerCase();
          const uniqueFileName = `${randomUUID()}${fileExt}`;
          cb(null, uniqueFileName);
        },
      }),
      fileFilter: (req: any, file: any, cb: any) => {
        const fileExt = path.extname(file.originalname).toLowerCase();
        if (fileExt !== '.csv') {
          return cb(new BadRequestException('Only CSV files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async importCsv(
    @Req() req: any,
    @Body() dto: ImportCsvDto,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('No CSV file uploaded');
    }

    // Validate concert existence
    const concert = await this.prisma.concert.findUnique({
      where: { id: dto.concert_id },
    });

    if (!concert) {
      // Cleanup uploaded file to prevent orphan files on disk
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new NotFoundException(`Concert with ID ${dto.concert_id} not found`);
    }

    // Create BackgroundJob tracking record
    const job = await this.prisma.backgroundJob.create({
      data: {
        trigger_by_user_id: req.user.sub,
        job_type: 'GUEST_LIST_IMPORT',
        target_id: dto.concert_id,
        status: 'PENDING',
        progress_percentage: 0,
        payload: {
          filePath: file.path,
          fileName: file.filename,
          originalName: file.originalname,
        },
      },
    });

    // Dispatch to RabbitMQ
    try {
      await this.rabbitMqService.publish('guest.import.exchange', 'guest.import', {
        jobId: job.id,
        concertId: dto.concert_id,
        filePath: file.path,
        userId: req.user.sub,
      });
    } catch (err) {
      // If dispatch fails, fail the job and delete the file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      await this.prisma.backgroundJob.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          error_message: `Failed to queue job: ${(err as Error).message}`,
          completed_at: new Date(),
        },
      });
      throw err;
    }

    return job;
  }

  @Get('job/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ORGANIZER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get background job status and progress' })
  async getJobStatus(@Param('id') id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException(`Invalid job ID format. Expected UUID, found: ${id}`);
    }
    const job = await this.prisma.backgroundJob.findUnique({
      where: { id },
    });
    if (!job) {
      throw new NotFoundException(`Background job with ID ${id} not found`);
    }
    return job;
  }

  @Get('concert/:concertId/guests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ORGANIZER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get paginated and filtered guest list for a concert' })
  async getGuestList(
    @Param('concertId') concertId: string,
    @Query() query: GuestListQueryDto,
  ) {
    if (!isUUID(concertId)) {
      throw new BadRequestException(`Invalid concert ID format. Expected UUID, found: ${concertId}`);
    }
    const concert = await this.prisma.concert.findUnique({
      where: { id: concertId },
    });
    if (!concert) {
      throw new NotFoundException(`Concert with ID ${concertId} not found`);
    }

    const { page = 1, limit = 10, search, category, is_scanned } = query;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      concert_id: concertId,
    };

    if (category) {
      whereClause.ticket_category = {
        equals: category.trim(),
        mode: 'insensitive',
      };
    }

    if (is_scanned !== undefined) {
      whereClause.is_scanned = is_scanned;
    }

    if (search) {
      const trimmedSearch = search.trim();
      whereClause.OR = [
        {
          full_name: {
            contains: trimmedSearch,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: trimmedSearch,
            mode: 'insensitive',
          },
        },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.guestList.count({ where: whereClause }),
      this.prisma.guestList.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { email: 'asc' },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
