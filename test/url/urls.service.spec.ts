import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Url } from '@/urls/entities/url.entity';
import { UrlService } from '@/urls/urls.service';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = (): MockRepository => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  softDelete: jest.fn(),
  increment: jest.fn(),
});

describe('UrlService', () => {
  let service: UrlService;
  let urlRepository: MockRepository<Url>;
  let configService: Partial<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: getRepositoryToken(Url),
          useFactory: createMockRepository,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:3000'),
          },
        },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
    urlRepository = module.get<MockRepository<Url>>(getRepositoryToken(Url));
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('shorten', () => {
    it('should create and return a shortened URL', async () => {
      const createDto = { originalUrl: 'https://google.com' };
      const user = null;

      urlRepository.findOne.mockResolvedValue(null);
      urlRepository.create.mockImplementation((dto) => dto);
      urlRepository.save.mockResolvedValue({
        id: 1,
        ...createDto,
        shortCode: 'mocked',
      });

      const result = await service.shorten(createDto, user);

      expect(urlRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('shortUrl');
      expect(result.shortUrl).toContain('http://localhost:3000/');
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if URL does not exist or user does not have permission', async () => {
      urlRepository.findOne.mockResolvedValue(null);
      const updateDto = { originalUrl: 'https://bing.com' };

      await expect(
        service.update('user-id', 'non-existent', updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCodeAndIncrementClicks', () => {
    it('should find a URL and increment its clicks', async () => {
      const shortCode = 'abcdef';
      const urlMock = {
        id: 1,
        shortCode,
        clicks: 0,
        originalUrl: 'https://example.com',
      };

      urlRepository.findOne.mockResolvedValue(urlMock);

      await service.findByCodeAndIncrementClicks(shortCode);

      expect(urlRepository.increment).toHaveBeenCalledWith(
        { shortCode },
        'clicks',
        1,
      );
    });

    it('should throw NotFoundException if URL with code does not exist', async () => {
      urlRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findByCodeAndIncrementClicks('non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
