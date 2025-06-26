import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'The user email address. Must be unique.',
    example: 'contact@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty({ message: 'Email cannot be empty.' })
  email: string;

  @ApiProperty({
    description: 'The user password. Must be at least 8 characters long.',
    example: 'StrongPassword123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @IsNotEmpty({ message: 'Password cannot be empty.' })
  password: string;
}
