import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        description: 'Email do usuário para autenticação.',
        example: 'contato@exemplo.com',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        description: 'Senha do usuário para autenticação.',
        example: 'SenhaForte123!',
    })
    @IsNotEmpty()
    password: string;
}
