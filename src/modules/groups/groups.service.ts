import { Injectable, NotFoundException } from '@nestjs/common';
import { Group } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupResponseDto } from './dto/group-response.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllBySection(
    sectionId: number,
    search?: string,
  ): Promise<GroupResponseDto[]> {
    await this.ensureSectionExists(sectionId);

    const query = search?.trim();

    const groups = await this.prisma.group.findMany({
      where: {
        sectionId,
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return groups.map((group) => this.toResponse(group));
  }

  async findOne(id: number): Promise<GroupResponseDto> {
    const group = await this.prisma.group.findUnique({ where: { id } });
    if (!group) {
      throw new NotFoundException('Группа не найдена');
    }

    return this.toResponse(group);
  }

  async create(
    sectionId: number,
    dto: CreateGroupDto,
  ): Promise<GroupResponseDto> {
    await this.ensureSectionExists(sectionId);

    const group = await this.prisma.group.create({
      data: {
        sectionId,
        name: dto.name,
        description: dto.description,
        figmaId: dto.figmaId,
      },
    });

    return this.toResponse(group);
  }

  async update(id: number, dto: UpdateGroupDto): Promise<GroupResponseDto> {
    await this.ensureExists(id);

    const group = await this.prisma.group.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        figmaId: dto.figmaId,
      },
    });

    return this.toResponse(group);
  }

  async remove(id: number): Promise<void> {
    await this.ensureExists(id);
    await this.prisma.group.delete({ where: { id } });
  }

  private async ensureExists(id: number): Promise<void> {
    const group = await this.prisma.group.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!group) {
      throw new NotFoundException('Группа не найдена');
    }
  }

  private async ensureSectionExists(sectionId: number): Promise<void> {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      select: { id: true },
    });

    if (!section) {
      throw new NotFoundException('Раздел не найден');
    }
  }

  private toResponse(group: Group): GroupResponseDto {
    return {
      id: group.id,
      sectionId: group.sectionId,
      name: group.name,
      description: group.description,
      figmaId: group.figmaId,
      createdAt: group.createdAt,
    };
  }
}
