import { InMemoryShortUrlRepository } from "../repository/in-memory-short-url.repository";
import { RedirectService } from "../service/redirect.service";

describe('RedirectService – concurrency safety', () => {
  let repo: InMemoryShortUrlRepository;
  let service: RedirectService;

  beforeEach(async () => {
    repo = new InMemoryShortUrlRepository();
    service = new RedirectService(repo);
    jest.useFakeTimers();

    const now = new Date('2026-01-01T00:00:00Z');
    jest.setSystemTime(now);

    await repo.tryInsert({
      short_code: 'concurrent',
      long_url: 'https://example.com',
      created_at: now,
      expires_at: new Date(now.getTime() + 60_000),
    });
  });

  it('increments click_count correctly under 100 concurrent requests', async () => {
    const now = new Date();

    const requests = Array.from({ length: 150 }).map(() =>
      service.resolveAndTrack('concurrent'),
    );

    await Promise.all(requests);

    const stats = await repo.findByShortCode('concurrent');
    expect(stats?.click_count).toBe(150);
  });
});

describe('RedirectService – deterministic TTL expiration', () => {
  let repo: InMemoryShortUrlRepository;
  let service: RedirectService;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns null once the short URL has expired (no sleep, deterministic)', async () => {
    /**
     * Step 1: Freeze time at a known instant
     */
    const t0 = new Date('2026-01-01T00:00:00Z');
    jest.setSystemTime(t0);

    repo = new InMemoryShortUrlRepository();
    service = new RedirectService(repo);

    /**
     * Step 2: Insert record with TTL = 10 seconds
     */
    await repo.tryInsert({
      short_code: 'ttl-test',
      long_url: 'https://example.com',
      created_at: t0,
      expires_at: new Date(t0.getTime() + 10_000),
    });

    /**
     * Step 3: Before expiration → should resolve
     */
    jest.setSystemTime(new Date(t0.getTime() + 9_000));

    const beforeExpiry = await service.resolveAndTrack('ttl-test');
    expect(beforeExpiry).toBe('https://example.com');

    /**
     * Step 4: After expiration → should return null
     */
    jest.setSystemTime(new Date(t0.getTime() + 11_000));

    const afterExpiry = await service.resolveAndTrack('ttl-test');
    expect(afterExpiry).toBeNull();
  });
});

