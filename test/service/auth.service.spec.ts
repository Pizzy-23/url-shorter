import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../../src/auth/auth.service';
import { LoginDto } from '../../src/auth/dto/login.dto';
import { CreateUserDto } from '../../src/user/dto/create-user.dto';
import { IUserService } from '@/user/user-service.interface';
import { User } from '../../src/user/entities/user.entity';

jest.mock('bcrypt', () => ({
  ...jest.requireActual('bcrypt'),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let userService: IUserService;
  let jwtService: JwtService;

  const mockUserService: IUserService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: 'IUserService',
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<IUserService>('IUserService');
    jwtService = module.get<JwtService>(JwtService);
    jest.clearAllMocks();
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
      id: 'uuid',
      email: loginDto.email,
      password: 'hashedpassword',
    } as User;

    it('should return an access token on successful login', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.sign as jest.Mock).mockReturnValue('test-token');

      const result = await authService.login(loginDto);
      expect(result).toEqual({ accessToken: 'test-token' });
      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

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
    });

    it('should throw ConflictException if email is already in use', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue({
        id: 'uuid',
        email: createUserDto.email,
      });

      await expect(authService.register(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
