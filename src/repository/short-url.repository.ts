import { ShortUrlEntity } from 'src/entity/short-url.entity';

export abstract class ShortUrlRepository {
  /**
   * Attempt to insert a new short URL record.
   */
  abstract tryInsert(input: {
    short_code: string;
    long_url: string;
    created_at: Date;
    expires_at: Date;
  }): Promise<boolean>;

  /**
   * Retrieve a short URL record by short_code.
   */
  abstract findByShortCode(shortCode: string): Promise<ShortUrlEntity | null>;

  /**
   * Increment click count by 1.
   */
  abstract incrementClickCount(shortCode: string): Promise<number>;

  /**
   * Update last accessed timestamp.
   */
  abstract updateLastAccessedAt(
    shortCode: string,
    accessedAt: Date,
  ): Promise<void>;

  /**
   * Delete a short URL record.
   */
  abstract delete(shortCode: string): Promise<void>;

  /**
   * Optional maintenance hook.
   */
  abstract deleteExpired(now: Date): Promise<number>;
}
