import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { LoginDto } from './dto/login.dto';

export interface IAuthService {
  register(createUserDto: CreateUserDto): Promise<UserResponseDto>;
  login(loginDto: LoginDto): Promise<{ accessToken: string }>;
}
