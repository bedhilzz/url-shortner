import { Injectable } from '@nestjs/common';
import { CreateShortUrlDto } from '../dto/create-short-url.dto';
import { ShortUrlRepository } from 'src/repository/short-url.repository';

@Injectable()
export class ShortenerService {
  constructor(private readonly repo: ShortUrlRepository) {}

  async createShortUrl(dto: CreateShortUrlDto) {
    const defaultTtl: number = Number(process.env.DEFAULT_TTL_SECONDS);
    const ttl = dto.ttl_seconds ?? defaultTtl;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttl * 1000);

    for (let attempt = 0; attempt < 5; attempt++) {
      const shortCode = this.generateCode(6);

      const inserted = await this.repo.tryInsert({
        short_code: shortCode,
        long_url: dto.long_url,
        created_at: now,
        expires_at: expiresAt,
      });

      if (inserted) {
        return {
          short_code: shortCode,
          expires_at: expiresAt.toISOString(),
        };
      }
    }

    throw new Error('Failed to generate unique short code');
  }

  private generateCode(length: number): string {
    const alphabet = process.env.VALID_ALPHABET!;
    let result = '';

    for (let i = 0; i < length; i++) {
      result += alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    return result;
  }
}
