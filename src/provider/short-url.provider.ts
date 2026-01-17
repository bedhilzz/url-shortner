import { ShortUrlRepository } from '../repository/short-url.repository';
import { InMemoryShortUrlRepository } from 'src/repository/in-memory-short-url.repository';

export const ShortUrlRepositoryProvider = {
  provide: ShortUrlRepository,
  useClass: InMemoryShortUrlRepository,
};
