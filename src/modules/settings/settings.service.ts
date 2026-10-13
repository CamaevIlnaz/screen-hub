import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SettingResponseDto } from './dto/setting-response.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(publishedOnly = false): Promise<SettingResponseDto[]> {
    const settings = await this.prisma.setting.findMany({
      where: publishedOnly ? { publish: true } : undefined,
      orderBy: { key: 'asc' },
    });

    return settings.map((setting) => this.toResponse(setting));
  }

  async get(key: string): Promise<string | null> {
    const setting = await this.prisma.setting.findUnique({ where: { key } });
    return setting?.value ?? null;
  }

  async create(
    key: string,
    value: string,
    publish = false,
  ): Promise<SettingResponseDto> {
    const settingKey = this.normalizeKey(key);
    const normalized = this.normalizeValue(value);

    const existing = await this.prisma.setting.findUnique({
      where: { key: settingKey },
    });
    if (existing) {
      throw new ConflictException('Настройка уже существует');
    }

    const setting = await this.prisma.setting.create({
      data: { key: settingKey, value: normalized, publish },
    });

    return this.toResponse(setting);
  }

  async set(
    key: string,
    value?: string,
    publish?: boolean,
  ): Promise<SettingResponseDto> {
    const settingKey = this.normalizeKey(key);

    if (value === undefined && publish === undefined) {
      throw new BadRequestException(
        'Нужно передать хотя бы одно поле для обновления',
      );
    }

    const existing = await this.prisma.setting.findUnique({
      where: { key: settingKey },
    });
    if (!existing) {
      throw new NotFoundException('Настройка не найдена');
    }

    const setting = await this.prisma.setting.update({
      where: { key: settingKey },
      data: {
        ...(value !== undefined ? { value: this.normalizeValue(value) } : {}),
        ...(publish !== undefined ? { publish } : {}),
      },
    });

    return this.toResponse(setting);
  }

  async remove(key: string): Promise<void> {
    const settingKey = this.normalizeKey(key);

    const existing = await this.prisma.setting.findUnique({
      where: { key: settingKey },
      select: { key: true },
    });
    if (!existing) {
      throw new NotFoundException('Настройка не найдена');
    }

    await this.prisma.setting.delete({ where: { key: settingKey } });
  }

  private normalizeKey(key: string): string {
    const normalized = key.trim();
    if (!normalized) {
      throw new BadRequestException('Ключ не может быть пустым');
    }

    return normalized;
  }

  private normalizeValue(value: string): string {
    const normalized = value.trim();
    if (!normalized) {
      throw new BadRequestException('Значение не может быть пустым');
    }

    return normalized;
  }

  private toResponse(setting: {
    key: string;
    value: string;
    publish: boolean;
    updatedAt: Date;
  }): SettingResponseDto {
    return {
      key: setting.key,
      value: setting.value,
      publish: setting.publish,
      updatedAt: setting.updatedAt,
    };
  }
}
