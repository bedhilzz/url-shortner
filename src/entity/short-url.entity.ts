export interface ShortUrlEntity {
  short_code: string;
  long_url: string;
  created_at: Date;
  expires_at: Date;
  click_count: number;
  last_accessed_at: Date | null;
}
