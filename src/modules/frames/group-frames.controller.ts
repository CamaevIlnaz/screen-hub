import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ErrorResponseDto } from '../auth/dto/error-response.dto';
import { CreateFrameDto } from './dto/create-frame.dto';
import { FrameResponseDto } from './dto/frame-response.dto';
import { FramesService } from './frames.service';

@ApiTags('frames')
@Controller('groups/:groupId/frames')
export class GroupFramesController {
  constructor(private readonly framesService: FramesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Список фреймов группы' })
  @ApiParam({
    name: 'groupId',
    type: Number,
    description: 'Идентификатор группы',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Поиск по названию и описанию',
  })
  @ApiOkResponse({
    description: 'Список фреймов группы',
    type: [FrameResponseDto],
  })
  @ApiNotFoundResponse({
    description: 'Группа не найдена',
    type: ErrorResponseDto,
  })
  findAll(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query('search') search?: string,
  ): Promise<FrameResponseDto[]> {
    return this.framesService.findAllByGroup(groupId, search);
  }

  @Post()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Создать фрейм в группе' })
  @ApiParam({
    name: 'groupId',
    type: Number,
    description: 'Идентификатор группы',
  })
  @ApiCreatedResponse({
    description: 'Фрейм создан',
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
    description: 'Группа не найдена',
    type: ErrorResponseDto,
  })
  create(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: CreateFrameDto,
  ): Promise<FrameResponseDto> {
    return this.framesService.create(groupId, dto);
  }
}
