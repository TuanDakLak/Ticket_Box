import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConcertRepository } from '../repositories/concert.repository';
import { ConcertResponseDto } from '../entities/concert-response.dto';
import { CreateConcertDto } from '../dtos/create-concert.dto';
import { UpdateConcertDto } from '../dtos/update-concert.dto';
import { ConcertListQueryDto } from '../dtos/concert-list-query.dto';
import { ConcertListResponseDto } from '../dtos/concert-list-response.dto';
import { PaginationMetaDto } from '../../../shared/dtos/pagination-meta.dto';
import { RedisService } from '../../../shared/redis';

@Injectable()
export class ConcertService {
  private readonly logger = new Logger(ConcertService.name);
  private readonly cacheTtlSeconds = 60 * 60 * 24;

  constructor(
    private readonly concertRepo: ConcertRepository,
    private readonly redisService: RedisService,
  ) { }

  async getConcerts(query: ConcertListQueryDto): Promise<ConcertListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const status = query.status;
    const search = query.search?.trim();
    const cacheKey = this.getConcertListCacheKey(page, limit, status, search);

    const cached = await this.redisService.getJson<ConcertListResponseDto>(cacheKey);
    if (cached) {
      this.logger.log(`[REDIS] getConcerts cache hit key=${cacheKey}`);
      return new ConcertListResponseDto(cached);
    }

    this.logger.log(`[DB] getConcerts cache miss key=${cacheKey}`);

    const { items, total } = await this.concertRepo.findManyWithPagination(page, limit, status, search);
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    const meta = new PaginationMetaDto({
      totalItems: total,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages,
      currentPage: page,
    });

    const response = new ConcertListResponseDto({ data: items, meta });
    await this.redisService.setJson(cacheKey, response, this.cacheTtlSeconds);
    return response;
  }

  async getConcertById(id: string): Promise<ConcertResponseDto> {
    const cacheKey = this.getConcertDetailCacheKey(id);
    const cached = await this.redisService.getJson<ConcertResponseDto>(cacheKey);
    if (cached) {
      this.logger.log(`[REDIS] getConcertById cache hit id=${id} key=${cacheKey}`);
      return new ConcertResponseDto(cached);
    }

    this.logger.log(`[DB] getConcertById cache miss id=${id} key=${cacheKey}`);

    const concert = await this.concertRepo.findById(id, false);
    if (!concert) throw new NotFoundException('Concert not found');

    await this.redisService.setJson(cacheKey, concert, this.cacheTtlSeconds);
    return concert;
  }

  async createConcert(payload: CreateConcertDto): Promise<ConcertResponseDto> {
    const created = await this.concertRepo.create(payload);
    await this.invalidateConcertListCaches();
    await this.redisService.setJson(this.getConcertDetailCacheKey(created.id), created, this.cacheTtlSeconds);
    return created;
  }

  async updateConcert(id: string, payload: UpdateConcertDto): Promise<ConcertResponseDto> {
    const existing = await this.concertRepo.findById(id, true);
    if (!existing) throw new NotFoundException('Concert not found');

    const updated = await this.concertRepo.update(id, payload);
    await this.redisService.setJson(this.getConcertDetailCacheKey(id), updated, this.cacheTtlSeconds);
    await this.invalidateConcertListCaches();
    return updated;
  }

  async deleteConcert(id: string): Promise<ConcertResponseDto> {
    const existing = await this.concertRepo.findById(id, true);
    if (!existing) throw new NotFoundException('Concert not found');

    if (existing.status === 'CANCELLED') return existing;

    const deleted = await this.concertRepo.delete(id);
    await this.redisService.setJson(this.getConcertDetailCacheKey(id), deleted, this.cacheTtlSeconds);
    await this.invalidateConcertListCaches();
    return deleted;
  }

  private getConcertListCacheKey(
    page: number,
    limit: number,
    status?: string,
    search?: string,
  ): string {
    const normalizedStatus = status ?? 'all';
    const normalizedSearch = search?.toLowerCase() ?? 'all';

    return `concerts:list:${page}:${limit}:${normalizedStatus}:${normalizedSearch}`;
  }

  private getConcertDetailCacheKey(id: string): string {
    return `concerts:detail:${id}`;
  }

  private async invalidateConcertListCaches(): Promise<void> {
    await this.redisService.deleteByPattern('concerts:list:*');
  }
}
