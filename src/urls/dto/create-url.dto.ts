import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class CreateUrlDto {
  @ApiProperty({
    example: 'https://github.com/nestjs/nest',
    description: 'The original, long URL to be shortened.',
  })
  @IsUrl({}, { message: 'The provided string must be a valid URL.' })
  originalUrl: string;
}
