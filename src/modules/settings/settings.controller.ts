import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ErrorResponseDto } from '../auth/dto/error-response.dto';
import { CreateSettingDto } from './dto/create-setting.dto';
import { SettingResponseDto } from './dto/setting-response.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { SettingsService } from './settings.service';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get()
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Список настроек',
    description:
      'Без авторизации возвращаются только настройки с publish=true. С авторизацией — все настройки из базы.',
  })
  @ApiOkResponse({
    description: 'Список настроек',
    type: [SettingResponseDto],
  })
  findAll(@CurrentUser() user?: AuthUser): Promise<SettingResponseDto[]> {
    return this.settingsService.findAll(!user);
  }

  @Post()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Добавить настройку' })
  @ApiCreatedResponse({
    description: 'Настройка создана',
    type: SettingResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Ошибка валидации',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Настройка уже существует',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Требуется авторизация',
    type: ErrorResponseDto,
  })
  create(@Body() dto: CreateSettingDto): Promise<SettingResponseDto> {
    return this.settingsService.create(dto.key, dto.value, dto.publish);
  }

  @Patch(':key')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Изменить настройку' })
  @ApiParam({
    name: 'key',
    type: String,
    description: 'Ключ настройки',
  })
  @ApiOkResponse({
    description: 'Настройка обновлена',
    type: SettingResponseDto,
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
    description: 'Настройка не найдена',
    type: ErrorResponseDto,
  })
  update(
    @Param('key') key: string,
    @Body() dto: UpdateSettingDto,
  ): Promise<SettingResponseDto> {
    return this.settingsService.set(key, dto.value, dto.publish);
  }

  @Delete(':key')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Удалить настройку' })
  @ApiParam({
    name: 'key',
    type: String,
    description: 'Ключ настройки',
  })
  @ApiNoContentResponse({ description: 'Настройка удалена' })
  @ApiUnauthorizedResponse({
    description: 'Требуется авторизация',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Настройка не найдена',
    type: ErrorResponseDto,
  })
  remove(@Param('key') key: string): Promise<void> {
    return this.settingsService.remove(key);
  }
}
