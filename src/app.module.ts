import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ShortUrlModule } from './short-url.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // available everywhere
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
    }),
    ShortUrlModule
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule { }
