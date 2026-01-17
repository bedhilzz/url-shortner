import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import express from 'express';
import { RedirectService } from '../service/redirect.service';

@Controller('s')
export class RedirectController {
  constructor(private readonly service: RedirectService) {}

  @Get(':short_code')
  async redirect(
    @Param('short_code') shortCode: string,
    @Res() res: express.Response,
  ) {
    const longUrl = await this.service.resolveAndTrack(shortCode);

    if (!longUrl) {
      throw new NotFoundException();
    }

    return res.redirect(302, longUrl);
  }
}
