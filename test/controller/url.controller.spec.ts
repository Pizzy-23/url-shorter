import { Test, TestingModule } from '@nestjs/testing';
import { UrlController } from '@/urls/urls.controller';
import { UrlService } from '@/urls/urls.service';
import { CreateUrlDto } from '@/urls/dto/create-url.dto';
import { UpdateUrlDto } from '@/urls/dto/update-url.dto';

// Mock do UrlService
const mockUrlService = {
  shorten: jest.fn(),
  findByUserId: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
};

// Mock de uma requisição com um usuário autenticado
const mockRequestWithUser = {
  user: {
    id: 'user-uuid-123',
    email: 'test@example.com',
  },
};

// Mock de uma requisição de um usuário anônimo
const mockAnonymousRequest = {
  user: null,
};

describe('UrlController', () => {
  let controller: UrlController;
  let service: UrlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlController],
      providers: [
        {
          provide: UrlService,
          useValue: mockUrlService,
        },
      ],
    }).compile();

    controller = module.get<UrlController>(UrlController);
    service = module.get<UrlService>(UrlService);
  });

  // Limpa os mocks depois de cada teste para evitar interferência
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('shorten', () => {
    it('should call the url service to shorten a URL with an authenticated user', async () => {
      const createDto: CreateUrlDto = { originalUrl: 'https://google.com' };
      const expectedResult = { shortUrl: 'http://short.url/abcdef' };

      mockUrlService.shorten.mockResolvedValue(expectedResult);

      const result = await controller.shorten(createDto, mockRequestWithUser);

      expect(service.shorten).toHaveBeenCalledWith(
        createDto,
        mockRequestWithUser.user,
      );
      expect(result).toBe(expectedResult);
    });

    it('should call the url service to shorten a URL for an anonymous user', async () => {
      const createDto: CreateUrlDto = { originalUrl: 'https://yahoo.com' };

      await controller.shorten(createDto, mockAnonymousRequest);

      expect(service.shorten).toHaveBeenCalledWith(createDto, null);
    });
  });

  describe('findAllByUser', () => {
    it("should call the url service to find a user's URLs", async () => {
      mockUrlService.findByUserId.mockResolvedValue([]);

      await controller.findAllByUser(mockRequestWithUser);

      expect(service.findByUserId).toHaveBeenCalledWith(
        mockRequestWithUser.user.id,
      );
    });
  });

  describe('update', () => {
    it('should call the url service to update a URL', async () => {
      const shortCode = 'abcdef';
      const updateDto: UpdateUrlDto = { originalUrl: 'https://new-url.com' };

      await controller.update(shortCode, updateDto, mockRequestWithUser);

      expect(service.update).toHaveBeenCalledWith(
        mockRequestWithUser.user.id,
        shortCode,
        updateDto,
      );
    });
  });

  describe('remove', () => {
    it('should call the url service to soft delete a URL', async () => {
      const shortCode = 'abcdef';

      await controller.remove(shortCode, mockRequestWithUser);
      expect(service.softDelete).toHaveBeenCalledWith(
        mockRequestWithUser.user.id,
        shortCode,
      );
    });
  });
});
