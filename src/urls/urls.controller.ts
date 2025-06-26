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
} from '@nestjs/common';
import { UrlsService } from './urls.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';

@ApiTags('urls')
@Controller('urls')
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) { }

  @UseGuards(OptionalJwtAuthGuard)
  @Post('shorten')
  @ApiOperation({ summary: 'Encurta uma nova URL' })
  @ApiResponse({ status: 201, description: 'Retorna a URL encurtada.', type: Object })
  @ApiResponse({ status: 400, description: 'URL inválida.' })
  @ApiBearerAuth('JWT-auth')
  shortenUrl(@Body() createUrlDto: CreateUrlDto, @Req() req) {
    const user = req.user || null;
    return this.urlsService.shortenUrl(createUrlDto, user);
  }

  // --- Rotas Protegidas ---

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get()
  @ApiOperation({ summary: 'Listar URLs do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de URLs retornada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  findUserUrls(@Req() req) {
    return this.urlsService.findUserUrls(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Patch(':shortCode')
  @ApiOperation({ summary: 'Atualizar uma URL encurtada' })
  @ApiResponse({ status: 200, description: 'URL atualizada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'URL não encontrada.' })
  update(
    @Param('shortCode') shortCode: string,
    @Body() updateUrlDto: UpdateUrlDto,
    @Req() req,
  ) {
    return this.urlsService.update(req.user.id, shortCode, updateUrlDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Delete(':shortCode')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar (soft delete) uma URL' })
  @ApiResponse({ status: 204, description: 'URL deletada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'URL não encontrada.' })
  remove(@Param('shortCode') shortCode: string, @Req() req) {
    return this.urlsService.softDelete(req.user.id, shortCode);
  }
}
