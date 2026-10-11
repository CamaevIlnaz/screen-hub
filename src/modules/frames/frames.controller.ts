import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ErrorResponseDto } from '../auth/dto/error-response.dto';
import { FrameResponseDto } from './dto/frame-response.dto';
import { UpdateFrameDto } from './dto/update-frame.dto';
import { FramesService } from './frames.service';

@ApiTags('frames')
@Controller('frames')
export class FramesController {
  constructor(private readonly framesService: FramesService) {}

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Получить фрейм по id' })
  @ApiParam({ name: 'id', type: Number, description: 'Идентификатор фрейма' })
  @ApiOkResponse({
    description: 'Фрейм',
    type: FrameResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Фрейм не найден',
    type: ErrorResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<FrameResponseDto> {
    return this.framesService.findOne(id);
  }

  @Patch(':id')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Обновить фрейм' })
  @ApiParam({ name: 'id', type: Number, description: 'Идентификатор фрейма' })
  @ApiOkResponse({
    description: 'Фрейм обновлён',
    type: FrameResponseDto,
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
    description: 'Фрейм не найден',
    type: ErrorResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFrameDto,
  ): Promise<FrameResponseDto> {
    return this.framesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Удалить фрейм' })
  @ApiParam({ name: 'id', type: Number, description: 'Идентификатор фрейма' })
  @ApiNoContentResponse({ description: 'Фрейм удалён' })
  @ApiUnauthorizedResponse({
    description: 'Требуется авторизация',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Фрейм не найден',
    type: ErrorResponseDto,
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.framesService.remove(id);
  }
}
