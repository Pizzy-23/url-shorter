import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Redirect,
} from '@nestjs/common';
import { UrlService } from './urls.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@ApiTags('URLs')
@Controller('urls')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('shorten')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Shorten a new URL' })
  @ApiResponse({ status: 201, description: 'Returns the shortened URL.' })
  @ApiResponse({ status: 400, description: 'Invalid URL provided.' })
  @ApiBearerAuth('JWT-auth')
  shorten(@Body() createUrlDto: CreateUrlDto, @Req() req) {
    const user = req.user || null;
    return this.urlService.shorten(createUrlDto, user);
  }

  // --- Protected Routes ---

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "Get all of the authenticated user's URLs" })
  @ApiResponse({
    status: 200,
    description: "Successfully returned the user's URLs.",
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAllByUser(@Req() req) {
    return this.urlService.findByUserId(req.user.id);
  }

  @Patch(':shortCode')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a shortened URL' })
  @ApiResponse({ status: 200, description: 'URL updated successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'URL not found.' })
  update(
    @Param('shortCode') shortCode: string,
    @Body() updateUrlDto: UpdateUrlDto,
    @Req() req,
  ) {
    return this.urlService.update(req.user.id, shortCode, updateUrlDto);
  }

  @Delete(':shortCode')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a shortened URL' })
  @ApiResponse({ status: 204, description: 'URL deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'URL not found.' })
  remove(@Param('shortCode') shortCode: string, @Req() req) {
    return this.urlService.softDelete(req.user.id, shortCode);
  }

  @Get(':shortCode')
  @Redirect()
  async redirect(@Param('shortCode') shortCode: string) {
    const url = await this.urlService.findByCodeAndIncrementClicks(shortCode);
    return { url: url.originalUrl, statusCode: 301 };
  }
}
