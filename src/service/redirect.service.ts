import { Injectable } from '@nestjs/common';
import { ShortUrlRepository } from '../repository/short-url.repository';

@Injectable()
export class RedirectService {
  constructor(private readonly repo: ShortUrlRepository) {}

  async resolveAndTrack(shortCode: string): Promise<string | null> {
    const record = await this.repo.findByShortCode(shortCode);

    if (!record) {
      return null;
    }

    const now = new Date();

    if (record.expires_at <= now) {
      await this.repo.delete(shortCode);
      return null;
    }

    await Promise.all([
      this.repo.incrementClickCount(shortCode),
      this.repo.updateLastAccessedAt(shortCode, now),
    ]);

    return record.long_url;
  }
}
