import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class CreateUrlDto {
    @ApiProperty({
        example: 'https://github.com/nestjs/nest',
        description: 'A URL original e longa a ser encurtada.',
    })
    @IsUrl({}, { message: 'A string fornecida deve ser uma URL válida.' })
    originalUrl: string;
}