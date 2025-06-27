import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { CreateUserDto } from '@/user/dto/create-user.dto';
import { LoginDto } from '@/auth/dto/login.dto';

// Mock do AuthService
const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  // Limpa os mocks depois de cada teste
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call auth service to register a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResponse = {
        id: 'uuid-123',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthService.register.mockResolvedValue(expectedResponse);

      const result = await controller.register(createUserDto);

      expect(service.register).toHaveBeenCalledWith(createUserDto);
      expect(result).toBe(expectedResponse);
    });
  });

  describe('login', () => {
    it('should call auth service to login a user and return an access token', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const expectedResponse = { accessToken: 'a-valid-jwt-token' };

      mockAuthService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);

      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(result).toBe(expectedResponse);
    });
  });
});
