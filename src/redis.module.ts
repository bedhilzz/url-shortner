import { Module } from '@nestjs/common';
import { RedisProvider } from './provider/redis.provider';

@Module({
  providers: [RedisProvider],
  exports: [RedisProvider],
})
export class RedisModule {}
