import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

export interface IUserService {
  create(createUserDto: CreateUserDto): Promise<User>;
  findByEmail(email: string): Promise<User | undefined>;
  findById(id: string): Promise<User | undefined>;
  findAll(): Promise<User[]>;
}

export const USER_SERVICE = 'IUserService';
