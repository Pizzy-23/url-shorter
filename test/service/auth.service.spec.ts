import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from '@/auth/auth.service';
import { LoginDto } from '@/auth/dto/login.dto';
import { CreateUserDto } from '@/user/dto/create-user.dto';
import { UserService } from '@/user/user.service';

jest.mock('bcrypt', () => ({
  ...jest.requireActual('bcrypt'),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let userService: Partial<UserService>;
  let jwtService: Partial<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password',
    };
    const user = {
      id: 'a-uuid',
      email: loginDto.email,
      password: 'hashedpassword',
    };

    it('should return an access token on successful login', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true); // Senha correta
      (jwtService.sign as jest.Mock).mockReturnValue('test-token');

      const result = await authService.login(loginDto);

      expect(result).toEqual({ accessToken: 'test-token' });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Senha incorreta

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    const createUserDto: CreateUserDto = {
      email: 'new@example.com',
      password: 'password123',
    };

    it('should successfully register a user', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(null);
      (userService.create as jest.Mock).mockResolvedValue({
        id: 'uuid',
        ...createUserDto,
      });

      const result = await authService.register(createUserDto);

      expect(userService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('id');
    });

    it('should throw ConflictException if email is already in use', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue({
        id: 'uuid',
        email: 'new@example.com',
      });

      await expect(authService.register(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
