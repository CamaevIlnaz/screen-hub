import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../auth/dto/error-response.dto';
import { SettingResponseDto } from './dto/setting-response.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { SETTING_KEYS, SettingsService } from './settings.service';

@ApiTags('settings')
@ApiCookieAuth()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Список настроек' })
  @ApiOkResponse({
    description: 'Список настроек',
    type: [SettingResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Требуется авторизация',
    type: ErrorResponseDto,
  })
  findAll(): Promise<SettingResponseDto[]> {
    return this.settingsService.findAll();
  }

  @Patch(':key')
  @ApiOperation({ summary: 'Изменить значение настройки' })
  @ApiParam({
    name: 'key',
    enum: SETTING_KEYS,
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
    return this.settingsService.set(key, dto.value);
  }
}
