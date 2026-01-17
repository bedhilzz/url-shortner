import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { ShortUrlRepository } from './short-url.repository';
import { ShortUrlEntity } from 'src/entity/short-url.entity';

@Injectable()
export class RedisShortUrlRepository extends ShortUrlRepository {
  constructor(private readonly redis: Redis) {
    super();
  }

  private key(shortCode: string): string {
    return `shorturl:${shortCode}`;
  }

  async tryInsert(input: {
    short_code: string;
    long_url: string;
    created_at: Date;
    expires_at: Date;
  }): Promise<boolean> {
    const key = this.key(input.short_code);

    const acquired = await this.redis.set(key, '1', 'NX');
    if (!acquired) return false;

    await this.redis.hset(key, {
      long_url: input.long_url,
      created_at: input.created_at.toISOString(),
      expires_at: input.expires_at.toISOString(),
      click_count: '0',
      last_accessed_at: '',
    });

    return true;
  }

  async findByShortCode(shortCode: string): Promise<ShortUrlEntity | null> {
    const data = await this.redis.hgetall(this.key(shortCode));
    if (!data || Object.keys(data).length === 0) {
      return null;
    }

    return {
      short_code: shortCode,
      long_url: data.long_url,
      created_at: new Date(data.created_at),
      expires_at: new Date(data.expires_at),
      click_count: Number(data.click_count ?? 0),
      last_accessed_at: data.last_accessed_at
        ? new Date(data.last_accessed_at)
        : null,
    };
  }

  async incrementClickCount(shortCode: string): Promise<number> {
    return this.redis.hincrby(this.key(shortCode), 'click_count', 1);
  }

  async updateLastAccessedAt(
    shortCode: string,
    accessedAt: Date,
  ): Promise<void> {
    await this.redis.hset(
      this.key(shortCode),
      'last_accessed_at',
      accessedAt.toISOString(),
    );
  }

  async delete(shortCode: string): Promise<void> {
    await this.redis.del(this.key(shortCode));
  }

  deleteExpired(_now: Date): Promise<number> {
    void _now; // mark as intentionally used
    return Promise.resolve(0);
  }
}
