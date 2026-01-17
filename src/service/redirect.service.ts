import { Injectable } from '@nestjs/common';
import { ShortUrlRepository } from 'src/repository/short-url.repository';

@Injectable()
export class RedirectService {
  constructor(private readonly repo: ShortUrlRepository) {}

  async resolveAndTrack(shortCode: string): Promise<string> {
    const record = await this.repo.findByShortCode(shortCode);

    if (!record) {
      throw new Error('Short URL not found');
    }

    const now = new Date();

    if (record.expires_at <= now) {
      await this.repo.delete(shortCode);
      throw new Error('Short URL expired');
    }

    await Promise.all([
      this.repo.incrementClickCount(shortCode),
      this.repo.updateLastAccessedAt(shortCode, now),
    ]);

    return record.long_url;
  }
}
