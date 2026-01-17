import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { StatsService } from '../service/stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly service: StatsService) {}

  @Get(':short_code')
  async getStats(@Param('short_code') shortCode: string) {
    const record = await this.service.getStats(shortCode);

    if (!record) {
      throw new NotFoundException();
    }

    return record;
  }
}
