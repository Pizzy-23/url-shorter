import { Test, TestingModule } from '@nestjs/testing';
import { ClassSerializerInterceptor, INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserController } from '@/user/user.controller';
import { UserService } from '@/user/user.service';
import { CreateUserDto } from '@/user/dto/create-user.dto';
import { User } from '@/user/entities/user.entity';

// Mock do UserService
const mockUserService = {
  create: jest.fn(),
  findAll: jest.fn(),
};

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService, // Usamos nosso mock
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call the user service to create a user and return the result without the password', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const createdUser = { id: 'uuid', ...createUserDto } as User; // O serviço retorna a entidade completa

      mockUserService.create.mockResolvedValue(createdUser);

      const result = await controller.register(createUserDto);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual({ id: 'uuid', email: 'test@example.com' }); // Verifica se a senha foi removida
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('findAll', () => {
    it('should call the user service to find all users and return them', async () => {
      const usersArray = [new User(), new User()];
      mockUserService.findAll.mockResolvedValue(usersArray);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toBe(usersArray);
    });
  });
});
