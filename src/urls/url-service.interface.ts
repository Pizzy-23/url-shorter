import { User } from '../user/entities/user.entity';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { Url } from './entities/url.entity';

export interface IUrlService {
  shorten(
    createUrlDto: CreateUrlDto,
    user: User | null,
  ): Promise<{ shortUrl: string }>;
  findByUserId(userId: string): Promise<Url[]>;
  update(
    userId: string,
    shortCode: string,
    updateUrlDto: UpdateUrlDto,
  ): Promise<Url>;
  softDelete(userId: string, shortCode: string): Promise<void>;
  findByCodeAndIncrementClicks(shortCode: string): Promise<Url>;
}
