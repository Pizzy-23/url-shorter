import { Controller, Get, Param, Redirect, Inject } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IUrlService } from './url-service.interface';

@ApiTags('Redirection')
@Controller()
export class RedirectController {
  constructor(
    @Inject('IUrlService') private readonly urlService: IUrlService,
  ) {}

  @Get(':shortCode')
  @Redirect()
  @ApiOperation({
    summary: 'Redirect a shortened URL to its original destination',
  })
  @ApiResponse({ status: 301, description: 'Successfully redirected.' })
  @ApiResponse({ status: 404, description: 'The shortened URL was not found.' })
  async redirect(@Param('shortCode') shortCode: string) {
    const url = await this.urlService.findByCodeAndIncrementClicks(shortCode);
    return { url: url.originalUrl, statusCode: 301 };
  }
}
