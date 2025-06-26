import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class UpdateUrlDto {
  @ApiProperty({
    example: 'https://docs.nestjs.com/',
    description: 'The new destination URL for the shortened link.',
  })
  @IsUrl({}, { message: 'The provided string must be a valid URL.' })
  originalUrl: string;
}
