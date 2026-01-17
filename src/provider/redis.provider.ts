import Redis from 'ioredis';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const RedisProvider: Provider = {
  provide: Redis,
  useFactory: (config: ConfigService) => {
    return new Redis({
      host: config.get<string>('REDIS_HOST'),
      port: config.get<number>('REDIS_PORT'),
      username: config.get<string>('REDIS_USERNAME') || undefined,
      password: config.get<string>('REDIS_PASSWORD') || undefined,
      db: config.get<number>('REDIS_DB') ?? 0,

      connectTimeout: config.get<number>('REDIS_CONNECT_TIMEOUT_MS') ?? 10000,

      tls: config.get<boolean>('REDIS_TLS') ? {} : undefined,

      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
    });
  },
  inject: [ConfigService],
};
