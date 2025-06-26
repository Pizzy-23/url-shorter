import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({
        description: 'O endereço de e-mail do usuário. Deve ser único.',
        example: 'contato@exemplo.com',
    })
    @IsEmail({}, { message: 'Por favor, forneça um endereço de e-mail válido.' })
    @IsNotEmpty({ message: 'O e-mail não pode estar vazio.' })
    email: string;

    @ApiProperty({
        description: 'A senha do usuário. Deve ter no mínimo 8 caracteres.',
        example: 'SenhaForte123!',
        minLength: 8,
    })
    @IsString()
    @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres.' })
    @IsNotEmpty({ message: 'A senha não pode estar vazia.' })
    password: string;
}