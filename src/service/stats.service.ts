import { Injectable } from '@nestjs/common';
import { ShortUrlRepository } from 'src/repository/short-url.repository';
import { ShortUrlEntity } from 'src/entity/short-url.entity';

@Injectable()
export class StatsService {
  constructor(private readonly repo: ShortUrlRepository) {}

  async getStats(shortCode: string): Promise<ShortUrlEntity | null> {
    const record = await this.repo.findByShortCode(shortCode);

    if (!record) {
      return null;
    }

    if (record.expires_at <= new Date()) {
      return null;
    }

    return record;
  }
}
