import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: "User's email for authentication.",
    example: 'contact@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: "User's password for authentication.",
    example: 'StrongPassword123!',
  })
  @IsNotEmpty()
  password: string;
}
