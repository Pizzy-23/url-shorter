import { Controller, Get, Param, Redirect } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UrlService } from './urls.service';

@ApiTags('Redirection')
@Controller()
export class RedirectController {
  constructor(private readonly urlService: UrlService) {}

  @Get(':shortCode')
  @Redirect()
  @ApiOperation({
    summary: 'Redirect a shortened URL to its original destination',
  })
  @ApiResponse({
    status: 302,
    description: 'Temporarily redirecting to the original URL.',
  })
  @ApiResponse({ status: 404, description: 'The shortened URL was not found.' })
  async redirect(@Param('shortCode') shortCode: string) {
    const url = await this.urlService.findByCodeAndIncrementClicks(shortCode);
    return { url: url.originalUrl, statusCode: 302 };
  }
}
