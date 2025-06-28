import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../../src/user/user.controller';
import { User } from '../../src/user/entities/user.entity';
import { IUserService } from '@/user/user-service.interface';

const mockUserService: IUserService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
};

describe('UserController', () => {
  let controller: UserController;
  let service: IUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: 'IUserService',
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<IUserService>('IUserService');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call the user service to find all users and return them', async () => {
      const usersArray = [new User(), new User()];
      (service.findAll as jest.Mock).mockResolvedValue(usersArray);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toBe(usersArray);
    });
  });
});
