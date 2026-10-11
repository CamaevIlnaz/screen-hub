import { Injectable, NotFoundException } from '@nestjs/common';
import { Frame } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFrameDto } from './dto/create-frame.dto';
import { FrameResponseDto } from './dto/frame-response.dto';
import { UpdateFrameDto } from './dto/update-frame.dto';

@Injectable()
export class FramesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByGroup(groupId: number): Promise<FrameResponseDto[]> {
    await this.ensureGroupExists(groupId);

    const frames = await this.prisma.frame.findMany({
      where: { groupId },
      orderBy: { updatedAt: 'desc' },
    });

    return frames.map((frame) => this.toResponse(frame));
  }

  async findOne(id: number): Promise<FrameResponseDto> {
    const frame = await this.prisma.frame.findUnique({ where: { id } });
    if (!frame) {
      throw new NotFoundException('Фрейм не найден');
    }

    return this.toResponse(frame);
  }

  async create(
    groupId: number,
    dto: CreateFrameDto,
  ): Promise<FrameResponseDto> {
    await this.ensureGroupExists(groupId);

    const frame = await this.prisma.frame.create({
      data: {
        groupId,
        name: dto.name,
        description: dto.description,
        figmaId: dto.figmaId,
      },
    });

    return this.toResponse(frame);
  }

  async update(id: number, dto: UpdateFrameDto): Promise<FrameResponseDto> {
    await this.ensureExists(id);

    const frame = await this.prisma.frame.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        figmaId: dto.figmaId,
      },
    });

    return this.toResponse(frame);
  }

  async remove(id: number): Promise<void> {
    await this.ensureExists(id);
    await this.prisma.frame.delete({ where: { id } });
  }

  private async ensureExists(id: number): Promise<void> {
    const frame = await this.prisma.frame.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!frame) {
      throw new NotFoundException('Фрейм не найден');
    }
  }

  private async ensureGroupExists(groupId: number): Promise<void> {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: { id: true },
    });

    if (!group) {
      throw new NotFoundException('Группа не найдена');
    }
  }

  private toResponse(frame: Frame): FrameResponseDto {
    return {
      id: frame.id,
      groupId: frame.groupId,
      name: frame.name,
      description: frame.description,
      figmaId: frame.figmaId,
      createdAt: frame.createdAt,
      updatedAt: frame.updatedAt,
    };
  }
}
