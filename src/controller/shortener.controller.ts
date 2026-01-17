import { Body, Controller, Post } from '@nestjs/common';
import { CreateShortUrlDto } from '../dto/create-short-url.dto';
import { ShortenerService } from '../service/shortener.service';

@Controller()
export class ShortenerController {
  constructor(private readonly service: ShortenerService) {}

  @Post('shorten')
  async shorten(@Body() dto: CreateShortUrlDto) {
    return this.service.createShortUrl(dto);
  }
}
