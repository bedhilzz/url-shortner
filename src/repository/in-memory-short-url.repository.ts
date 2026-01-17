import { Injectable } from '@nestjs/common';
import { ShortUrlRepository } from './short-url.repository';
import { ShortUrlEntity } from 'src/entity/short-url.entity';

@Injectable()
export class InMemoryShortUrlRepository extends ShortUrlRepository {
  private store: Map<string, ShortUrlEntity>;

  constructor() {
    super();
    this.store = new Map<string, ShortUrlEntity>();
  }

  async delete(shortCode: string): Promise<void> {
    this.store.delete(shortCode);
    return Promise.resolve();
  }

  async deleteExpired(now: Date): Promise<number> {
    let count = 0;

    for (const [key, value] of this.store.entries()) {
      if (value.expires_at < now) {
        this.store.delete(key);
        count++;
      }
    }

    return Promise.resolve(count);
  }

  async tryInsert(input: {
    short_code: string;
    long_url: string;
    created_at: Date;
    expires_at: Date;
  }): Promise<boolean> {
    if (this.store.has(input.short_code)) {
      return Promise.resolve(false);
    }

    this.store.set(input.short_code, {
      short_code: input.short_code,
      long_url: input.long_url,
      created_at: input.created_at,
      expires_at: input.expires_at,
      click_count: 0,
      last_accessed_at: null,
    });

    return Promise.resolve(true);
  }

  findByShortCode(short_code: string): Promise<ShortUrlEntity | null> {
    return Promise.resolve(this.store.get(short_code) ?? null);
  }

  incrementClickCount(short_code: string): Promise<number> {
    const record = this.store.get(short_code);
    if (!record) {
      return Promise.resolve(0);
    }

    record.click_count += 1;
    return Promise.resolve(record.click_count);
  }

  updateLastAccessedAt(short_code: string, accessed_at: Date): Promise<void> {
    const record = this.store.get(short_code);
    if (record) {
      record.last_accessed_at = accessed_at;
    }

    return Promise.resolve();
  }
}
