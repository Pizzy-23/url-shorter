import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { CreateUserDto } from '@/user/dto/create-user.dto';
import { User } from '@/user/entities/user.entity';
import { UserService } from '@/user/user.service';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = (): MockRepository => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
});

describe('UserService', () => {
  let service: UserService;
  let userRepository: MockRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useFactory: createMockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<MockRepository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully create and return a user', async () => {
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(createUserDto as any);
      userRepository.save.mockResolvedValue({ id: 'a-uuid', ...createUserDto });

      const result = await service.create(createUserDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(userRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(userRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ id: 'a-uuid', ...createUserDto });
    });

    it('should throw a ConflictException if the email already exists', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 'a-uuid',
        ...createUserDto,
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const usersArray = [
        { id: '1', email: 'user1@test.com' },
        { id: '2', email: 'user2@test.com' },
      ];
      userRepository.find.mockResolvedValue(usersArray);

      const result = await service.findAll();

      expect(userRepository.find).toHaveBeenCalled();
      expect(result).toEqual(usersArray);
    });
  });
});
