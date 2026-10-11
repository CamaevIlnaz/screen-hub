import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiCreatedResponse,
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
import { CreateVersionDto } from './dto/create-version.dto';
import { VersionResponseDto } from './dto/version-response.dto';
import { parseVersionMultipart } from './multipart.util';
import { VersionsService } from './versions.service';

@ApiTags('versions')
@Controller('frames/:frameId/versions')
export class FrameVersionsController {
  constructor(private readonly versionsService: VersionsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Список версий фрейма' })
  @ApiParam({
    name: 'frameId',
    type: Number,
    description: 'Идентификатор фрейма',
  })
  @ApiOkResponse({
    description: 'Список версий фрейма',
    type: [VersionResponseDto],
  })
  @ApiNotFoundResponse({
    description: 'Фрейм не найден',
    type: ErrorResponseDto,
  })
  findAll(
    @Param('frameId', ParseIntPipe) frameId: number,
  ): Promise<VersionResponseDto[]> {
    return this.versionsService.findAllByFrame(frameId);
  }

  @Public()
  @Get('current')
  @ApiOperation({ summary: 'Текущая (последняя) версия фрейма' })
  @ApiParam({
    name: 'frameId',
    type: Number,
    description: 'Идентификатор фрейма',
  })
  @ApiOkResponse({
    description: 'Текущая версия фрейма',
    type: VersionResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Фрейм или версия не найдены',
    type: ErrorResponseDto,
  })
  findCurrent(
    @Param('frameId', ParseIntPipe) frameId: number,
  ): Promise<VersionResponseDto> {
    return this.versionsService.findCurrentByFrame(frameId);
  }

  @Post()
  @ApiCookieAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateVersionDto })
  @ApiOperation({ summary: 'Создать версию фрейма с файлом' })
  @ApiParam({
    name: 'frameId',
    type: Number,
    description: 'Идентификатор фрейма',
  })
  @ApiCreatedResponse({
    description: 'Версия создана',
    type: VersionResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Ошибка валидации или файл не передан',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Требуется авторизация',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Фрейм не найден',
    type: ErrorResponseDto,
  })
  async create(
    @Param('frameId', ParseIntPipe) frameId: number,
    @Req() request: FastifyRequest,
  ): Promise<VersionResponseDto> {
    const payload = await parseVersionMultipart(request);
    if (!payload.file) {
      throw new BadRequestException('Файл обязателен');
    }

    return this.versionsService.create(
      frameId,
      payload.file,
      payload.description,
    );
  }
}
