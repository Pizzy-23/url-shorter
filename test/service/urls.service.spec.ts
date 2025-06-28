import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import * as nanoid from 'nanoid';
import { Repository } from 'typeorm';

import { UrlService } from '@/urls/urls.service';
import { Url } from '../../src/urls/entities/url.entity';
import { MetricsService } from '../../src/metrics/metrics.service';

jest.mock('nanoid', () => ({
  nanoid: jest.fn(),
}));

describe('UrlsService', () => {
  let service: UrlService;
  let repository: Repository<Url>;

  const mockUrlRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    softDelete: jest.fn(),
    increment: jest.fn(),
  };

  const mockMetricsService = {
    urlShortenedCounter: {
      inc: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('http://localhost:3000'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: getRepositoryToken(Url),
          useValue: mockUrlRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
    repository = module.get<Repository<Url>>(getRepositoryToken(Url));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('shorten', () => {
    it('should create and save a new short URL', async () => {
      (nanoid.nanoid as jest.Mock).mockReturnValue('abc123');

      const createDto = { originalUrl: 'https://google.com' };
      const newUrlPayload = {
        shortCode: 'abc123',
        originalUrl: createDto.originalUrl,
        user: null,
        userId: null,
      };

      mockUrlRepository.findOne.mockResolvedValue(null);
      mockUrlRepository.create.mockReturnValue(newUrlPayload);
      mockUrlRepository.save.mockResolvedValue(newUrlPayload);

      const result = await service.shorten(createDto, null);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ shortCode: 'abc123' }),
      );
      expect(mockMetricsService.urlShortenedCounter.inc).toHaveBeenCalledWith({
        user_type: 'anonymous',
      });
      expect(result.shortUrl).toBe('http://localhost:3000/abc123');
    });
  });

  describe('findByCodeAndIncrementClicks', () => {
    it('should find a URL and increment its clicks', async () => {
      const shortCode = 'found_me';
      const urlMock = {
        id: 1,
        originalUrl: 'https://example.com',
        shortCode,
      } as Url;

      mockUrlRepository.findOne.mockResolvedValue(urlMock);
      mockUrlRepository.increment.mockResolvedValue(undefined);

      const result = await service.findByCodeAndIncrementClicks(shortCode);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { shortCode, deletedAt: expect.anything() },
      });
      expect(repository.increment).toHaveBeenCalledWith(
        { shortCode },
        'clicks',
        1,
      );
      expect(result).toEqual(urlMock);
    });

    it('should throw NotFoundException if URL is not found', async () => {
      mockUrlRepository.findOne.mockResolvedValue(null);
      await expect(
        service.findByCodeAndIncrementClicks('not_found'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
