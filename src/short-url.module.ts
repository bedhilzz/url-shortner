import { Module } from '@nestjs/common';
import { ShortenerService } from './service/shortener.service';
import { RedirectService } from './service/redirect.service';
import { StatsService } from './service/stats.service';
import { ShortUrlRepositoryProvider } from './provider/short-url.provider';
import { RedisModule } from './redis.module';

@Module({
  imports: [RedisModule], // provides Redis client
  providers: [
    ShortenerService,
    RedirectService,
    StatsService,
    ShortUrlRepositoryProvider,
  ],
  exports: [ShortenerService, RedirectService, StatsService],
})
export class ShortUrlModule {}
