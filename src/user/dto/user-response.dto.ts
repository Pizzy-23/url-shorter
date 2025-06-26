import { ApiProperty } from '@nestjs/swagger';
import { Url } from '../../urls/entities/url.entity';

export class UserResponseDto {
  @ApiProperty({
    example: '0e2646b9-4a9c-449d-8395-559d86395b60',
    description: 'The unique identifier of the user.',
  })
  id: string;

  @ApiProperty({
    example: 'contact@example.com',
    description: 'The email address of the user.',
  })
  email: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
