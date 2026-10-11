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
import { SectionResponseDto } from './dto/section-response.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { SectionsService } from './sections.service';

@ApiTags('sections')
@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Получить раздел по id' })
  @ApiParam({ name: 'id', type: Number, description: 'Идентификатор раздела' })
  @ApiOkResponse({
    description: 'Раздел',
    type: SectionResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Раздел не найден',
    type: ErrorResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<SectionResponseDto> {
    return this.sectionsService.findOne(id);
  }

  @Patch(':id')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Обновить раздел' })
  @ApiParam({ name: 'id', type: Number, description: 'Идентификатор раздела' })
  @ApiOkResponse({
    description: 'Раздел обновлён',
    type: SectionResponseDto,
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
    description: 'Раздел не найден',
    type: ErrorResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSectionDto,
  ): Promise<SectionResponseDto> {
    return this.sectionsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Удалить раздел' })
  @ApiParam({ name: 'id', type: Number, description: 'Идентификатор раздела' })
  @ApiNoContentResponse({ description: 'Раздел удалён' })
  @ApiUnauthorizedResponse({
    description: 'Требуется авторизация',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Раздел не найден',
    type: ErrorResponseDto,
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.sectionsService.remove(id);
  }
}
