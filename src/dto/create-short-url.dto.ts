import { IsOptional, IsInt, IsUrl, MaxLength } from 'class-validator';

export class CreateShortUrlDto {
  @IsUrl(
    { require_protocol: true, protocols: ['http', 'https'] },
    { message: 'long_url must be a valid HTTP/HTTPS URL' },
  )
  @MaxLength(2048)
  long_url!: string;

  @IsOptional()
  @IsInt()
  ttl_seconds?: number;
}
