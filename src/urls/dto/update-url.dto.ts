import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class UpdateUrlDto {
    @ApiProperty({
        example: 'https://docs.nestjs.com/',
        description: 'A nova URL de destino para o link encurtado.',
    })
    @IsUrl({}, { message: 'A string fornecida deve ser uma URL válida.' })
    originalUrl: string;
}