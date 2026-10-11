import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { Public } from '../../common/decorators/public.decorator';
import { ErrorResponseDto } from '../auth/dto/error-response.dto';
import { UpdateVersionDto } from './dto/update-version.dto';
import { VersionResponseDto } from './dto/version-response.dto';
import { parseVersionMultipart } from './multipart.util';
import { VersionsService } from './versions.service';

@ApiTags('versions')
@Controller('versions')
export class VersionsController {
  constructor(private readonly versionsService: VersionsService) {}

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Получить версию по id' })
  @ApiParam({ name: 'id', type: Number, description: 'Идентификатор версии' })
  @ApiOkResponse({
    description: 'Версия',
    type: VersionResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Версия не найдена',
    type: ErrorResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<VersionResponseDto> {
    return this.versionsService.findOne(id);
  }

  @Patch(':id')
  @ApiCookieAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateVersionDto })
  @ApiOperation({ summary: 'Обновить версию (файл и/или описание)' })
  @ApiParam({ name: 'id', type: Number, description: 'Идентификатор версии' })
  @ApiOkResponse({
    description: 'Версия обновлена',
    type: VersionResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Ошибка валидации',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Требуется авторизация',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Версия не найдена',
    type: ErrorResponseDto,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: FastifyRequest,
  ): Promise<VersionResponseDto> {
    const payload = await parseVersionMultipart(request);
    return this.versionsService.update(
      id,
      payload.file,
      payload.description,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Удалить версию' })
  @ApiParam({ name: 'id', type: Number, description: 'Идентификатор версии' })
  @ApiNoContentResponse({ description: 'Версия удалена' })
  @ApiUnauthorizedResponse({
    description: 'Требуется авторизация',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Версия не найдена',
    type: ErrorResponseDto,
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.versionsService.remove(id);
  }
}
