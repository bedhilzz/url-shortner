import { Injectable } from "@nestjs/common";
import { ShortUrlRepository } from "./short-url.repository";
import { ShortUrlEntity } from "src/entity/short-url.entity";

@Injectable()
export class InMemoryShortUrlRepository extends ShortUrlRepository {
  private store: Map<string, ShortUrlEntity>;

  constructor() {
    super();

    this.store = new Map<string, ShortUrlEntity>();
  }
  
  delete(shortCode: string): Promise<void> {
    this.store.delete(shortCode);
    return Promise.resolve();
  }
  deleteExpired(now: Date): Promise<number> {
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
    if (this.store.has(input.short_code)) return false;

    this.store.set(input.short_code, {
      long_url: input.long_url,
      expires_at: input.expires_at,
      click_count: 0,
      last_accessed_at: null,
      short_code: input.short_code,
      created_at: input.created_at
    });

    return true;
  }

  async findByShortCode(short_code: string) {
    return this.store.get(short_code) as ShortUrlEntity ?? null;
  }

  async incrementClickCount(short_code: string) {
    const record = this.store.get(short_code);
    if (!record) return 0;

    record.click_count += 1;
    return record.click_count;
  }

  async updateLastAccessedAt(
    short_code: string, 
    accessed_at: Date,
  ): Promise<void> {
    const record = this.store.get(short_code);
    if (!record) return;

    record.click_count += 1;
    record.last_accessed_at = accessed_at;
  }
}