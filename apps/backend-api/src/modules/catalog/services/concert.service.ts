import { Injectable, NotFoundException } from '@nestjs/common';
import { ConcertRepository } from '../repositories/concert.repository';
import { ConcertResponseDto } from '../entities/concert-response.dto';
import { CreateConcertDto } from '../dtos/create-concert.dto';
import { UpdateConcertDto } from '../dtos/update-concert.dto';
import { ConcertListQueryDto } from '../dtos/concert-list-query.dto';
import { ConcertListResponseDto } from '../dtos/concert-list-response.dto';
import { PaginationMetaDto } from '../../../shared/dtos/pagination-meta.dto';

@Injectable()
export class ConcertService {
  constructor(private readonly concertRepo: ConcertRepository) {}

  async getConcerts(query: ConcertListQueryDto): Promise<ConcertListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const status = query.status;
    const search = query.search?.trim();

    const { items, total } = await this.concertRepo.findManyWithPagination(page, limit, status, search);
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    const meta = new PaginationMetaDto({
      totalItems: total,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages,
      currentPage: page,
    });

    return new ConcertListResponseDto({ data: items, meta });
  }

  async getConcertById(id: string): Promise<ConcertResponseDto> {
    const concert = await this.concertRepo.findById(id, false);
    if (!concert) throw new NotFoundException('Concert not found');
    return concert;
  }

  async createConcert(payload: CreateConcertDto): Promise<ConcertResponseDto> {
    return this.concertRepo.create(payload);
  }

  async updateConcert(id: string, payload: UpdateConcertDto): Promise<ConcertResponseDto> {
    const existing = await this.concertRepo.findById(id, true);
    if (!existing) throw new NotFoundException('Concert not found');

    return this.concertRepo.update(id, payload);
  }

  async deleteConcert(id: string): Promise<ConcertResponseDto> {
    const existing = await this.concertRepo.findById(id, true);
    if (!existing) throw new NotFoundException('Concert not found');

    if (existing.status === 'CANCELLED') return existing;
    return this.concertRepo.softDelete(id);
  }
}
