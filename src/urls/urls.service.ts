import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Url } from './entities/url.entity';
import { nanoid } from 'nanoid';

import { ConfigService } from '@nestjs/config';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class UrlsService {
  constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
    private readonly configService: ConfigService,
  ) { }


  async shortenUrl(
    createUrlDto: CreateUrlDto,
    user: User | null,
  ): Promise<{ shortUrl: string }> {
    let shortCode: string;
    let isUnique = false;

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

  async findUserUrls(userId: string) {
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
        'URL não encontrada ou você não tem permissão para editá-la.',
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
        'URL não encontrada ou você não tem permissão para excluí-la.',
      );
    }
  }

  async findByCodeAndIncrementClicks(shortCode: string): Promise<Url> {
    const url = await this.urlRepository.findOne({
      where: { shortCode, deletedAt: IsNull() },
    });

    if (!url) {
      throw new NotFoundException('A URL encurtada não foi encontrada.');
    }
    await this.urlRepository.increment({ shortCode }, 'clicks', 1);

    return url;
  }
}
