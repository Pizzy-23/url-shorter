import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { nanoid } from 'nanoid';
import { ConfigService } from '@nestjs/config';

import { Url } from './entities/url.entity';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { User } from '../user/entities/user.entity';
import { MetricsService } from '../metrics/metrics.service';
import { IUrlService } from './url-service.interface';

@Injectable()
export class UrlService implements IUrlService {
  constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
    private readonly configService: ConfigService,
    private readonly metricsService: MetricsService,
  ) {}

  async shorten(
    createUrlDto: CreateUrlDto,
    user: User | null,
  ): Promise<{ shortUrl: string }> {
    let shortCode: string;
    let isUnique = false;

    this.metricsService.urlShortenedCounter.inc({
      user_type: user ? 'authenticated' : 'anonymous',
    });

    while (!isUnique) {
      shortCode = nanoid(6);
      const existing = await this.urlRepository.findOne({
        where: { shortCode },
      });
      if (!existing) {
        isUnique = true;
      }
    }

    const newUrl = this.urlRepository.create({
      originalUrl: createUrlDto.originalUrl,
      shortCode,
      user: user,
      userId: user ? user.id : null,
    });

    await this.urlRepository.save(newUrl);

    const domain = this.configService.get('APP_DOMAIN');
    return { shortUrl: `${domain}/${shortCode}` };
  }

  async findByUserId(userId: string): Promise<Url[]> {
    return this.urlRepository.find({
      where: { userId, deletedAt: IsNull() },
      select: ['shortCode', 'originalUrl', 'clicks', 'updatedAt', 'createdAt'],
    });
  }

  async update(
    userId: string,
    shortCode: string,
    updateUrlDto: UpdateUrlDto,
  ): Promise<Url> {
    const url = await this.urlRepository.findOne({
      where: { shortCode, userId, deletedAt: IsNull() },
    });

    if (!url) {
      throw new NotFoundException(
        'URL not found or you do not have permission to edit it.',
      );
    }

    url.originalUrl = updateUrlDto.originalUrl;
    return this.urlRepository.save(url);
  }

  async softDelete(userId: string, shortCode: string): Promise<void> {
    const result = await this.urlRepository.softDelete({
      shortCode,
      userId,
    });

    if (result.affected === 0) {
      throw new NotFoundException(
        'URL not found or you do not have permission to delete it.',
      );
    }
  }

  async findByCodeAndIncrementClicks(shortCode: string): Promise<Url> {
    const url = await this.urlRepository.findOne({
      where: { shortCode, deletedAt: IsNull() },
    });

    if (!url) {
      throw new NotFoundException('The shortened URL was not found.');
    }

    await this.urlRepository.increment({ shortCode }, 'clicks', 1);
    return url;
  }
}
