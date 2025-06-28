import { Module } from '@nestjs/common';
import { UrlService } from './urls.service';
import { UrlController } from './urls.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from './entities/url.entity';
import { ConfigModule } from '@nestjs/config';
import { RedirectController } from './redirect.controller';
import { MetricsModule } from '@/metrics/metrics.module';

@Module({
  imports: [TypeOrmModule.forFeature([Url]), ConfigModule, MetricsModule],
  controllers: [UrlController, RedirectController],
  providers: [
    {
      provide: 'IUrlService',
      useClass: UrlService,
    },
  ],
  exports: ['IUrlService'],
})
export class UrlsModule {}
