import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../auth/dto/error-response.dto';
import { FigmaSyncResultDto } from './dto/figma-sync-result.dto';
import { FigmaSyncService } from './figma-sync.service';

@ApiTags('figma')
@Controller('sections/:id/figma-sync')
export class SectionFigmaSyncController {
  constructor(private readonly figmaSyncService: FigmaSyncService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Синхронизировать раздел с Figma',
    description:
      'Загружает группы (первый уровень нод section) и фреймы внутри них, создаёт новые SVG-версии для изменившихся фреймов',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Идентификатор раздела' })
  @ApiOkResponse({
    description: 'Результат синхронизации',
    type: FigmaSyncResultDto,
  })
  @ApiBadRequestResponse({
    description:
      'Не заполнен figmaId раздела/проекта или токен Figma в настройках',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Требуется авторизация',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Раздел не найден',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Синхронизация раздела уже выполняется',
    type: ErrorResponseDto,
  })
  @ApiBadGatewayResponse({
    description: 'Ошибка Figma API',
    type: ErrorResponseDto,
  })
  sync(@Param('id', ParseIntPipe) id: number): Promise<FigmaSyncResultDto> {
    return this.figmaSyncService.syncSection(id);
  }
}
