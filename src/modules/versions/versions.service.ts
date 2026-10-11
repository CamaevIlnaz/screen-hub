import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Version } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { VersionResponseDto } from './dto/version-response.dto';
import type { UploadedVersionFile } from './version-storage.service';
import { VersionStorageService } from './version-storage.service';

@Injectable()
export class VersionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly versionStorage: VersionStorageService,
  ) {}

  async findAllByFrame(frameId: number): Promise<VersionResponseDto[]> {
    await this.ensureFrameExists(frameId);

    const versions = await this.prisma.version.findMany({
      where: { frameId },
      orderBy: { version: 'desc' },
    });

    return versions.map((item) => this.toResponse(item));
  }

  async findCurrentByFrame(frameId: number): Promise<VersionResponseDto> {
    await this.ensureFrameExists(frameId);

    const version = await this.prisma.version.findFirst({
      where: { frameId },
      orderBy: { version: 'desc' },
    });

    if (!version) {
      throw new NotFoundException('Версия не найдена');
    }

    return this.toResponse(version);
  }

  async findOne(id: number): Promise<VersionResponseDto> {
    const version = await this.prisma.version.findUnique({ where: { id } });
    if (!version) {
      throw new NotFoundException('Версия не найдена');
    }

    return this.toResponse(version);
  }

  async create(
    frameId: number,
    file: UploadedVersionFile,
    description?: string,
  ): Promise<VersionResponseDto> {
    await this.ensureFrameExists(frameId);

    const latest = await this.prisma.version.findFirst({
      where: { frameId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });

    const nextVersion = (latest?.version ?? 0) + 1;
    const filename = this.versionStorage.saveVersionFile(
      frameId,
      nextVersion,
      file,
    );

    try {
      const version = await this.prisma.version.create({
        data: {
          frameId,
          version: nextVersion,
          filename,
          description,
        },
      });

      return this.toResponse(version);
    } catch (error) {
      this.versionStorage.deleteFile(filename);
      throw error;
    }
  }

  async update(
    id: number,
    file?: UploadedVersionFile,
    description?: string,
  ): Promise<VersionResponseDto> {
    const existing = await this.prisma.version.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Версия не найдена');
    }

    if (!file && description === undefined) {
      throw new BadRequestException(
        'Нужно передать файл и/или описание для обновления',
      );
    }

    let filename = existing.filename;
    let previousFilename: string | undefined;

    if (file) {
      previousFilename = existing.filename;
      filename = this.versionStorage.saveVersionFile(
        existing.frameId,
        existing.version,
        file,
      );
    }

    try {
      const version = await this.prisma.version.update({
        where: { id },
        data: {
          filename,
          ...(description !== undefined ? { description } : {}),
        },
      });

      if (previousFilename && previousFilename !== filename) {
        this.versionStorage.deleteFile(previousFilename);
      }

      return this.toResponse(version);
    } catch (error) {
      if (previousFilename && filename !== previousFilename) {
        this.versionStorage.deleteFile(filename);
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    const existing = await this.prisma.version.findUnique({
      where: { id },
      select: { id: true, filename: true },
    });

    if (!existing) {
      throw new NotFoundException('Версия не найдена');
    }

    await this.prisma.version.delete({ where: { id } });
    this.versionStorage.deleteFile(existing.filename);
  }

  private async ensureFrameExists(frameId: number): Promise<void> {
    const frame = await this.prisma.frame.findUnique({
      where: { id: frameId },
      select: { id: true },
    });

    if (!frame) {
      throw new NotFoundException('Фрейм не найден');
    }
  }

  private toResponse(version: Version): VersionResponseDto {
    return {
      id: version.id,
      frameId: version.frameId,
      version: version.version,
      description: version.description,
      filename: version.filename,
      createdAt: version.createdAt,
    };
  }
}
