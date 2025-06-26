import { Module } from '@nestjs/common';
import { UrlService } from './urls.service';
import { UrlController } from './urls.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from './entities/url.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Url]), ConfigModule],
  controllers: [UrlController],
  providers: [UrlService],
  exports: [UrlService],
})
export class UrlsModule {}
