import { Test, TestingModule } from '@nestjs/testing';
import { UrlController } from '../../src/urls/urls.controller';
import { IUrlService } from '@/urls/url-service.interface';
import { CreateUrlDto } from '../../src/urls/dto/create-url.dto';

// Mock completo do serviço
const mockUrlService: IUrlService = {
  shorten: jest.fn(),
  findByUserId: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  findByCodeAndIncrementClicks: jest.fn(),
};

describe('UrlController', () => {
  let controller: UrlController;
  let service: IUrlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlController],
      providers: [
        {
          provide: 'IUrlService',
          useValue: mockUrlService,
        },
      ],
    }).compile();

    controller = module.get<UrlController>(UrlController);
    service = module.get<IUrlService>('IUrlService');
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('shorten', () => {
    it('should call the url service to shorten a URL', async () => {
      const createDto: CreateUrlDto = { originalUrl: 'https://a-url.com' };
      const mockRequest = { user: null };

      const expectedResult = { shortUrl: 'http://localhost:3000/mock123' };
      (service.shorten as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.shorten(createDto, mockRequest);

      expect(service.shorten).toHaveBeenCalledWith(createDto, null);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAllByUser', () => {
    it("should call the service to find all user's URLs", async () => {
      const mockRequest = { user: { id: 'user-uuid' } };

      (service.findByUserId as jest.Mock).mockResolvedValue([]);

      await controller.findAllByUser(mockRequest);

      expect(service.findByUserId).toHaveBeenCalledWith('user-uuid');
    });
  });
});
