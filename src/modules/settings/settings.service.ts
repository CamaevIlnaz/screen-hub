import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SettingResponseDto } from './dto/setting-response.dto';

export const SettingKey = {
  figmaToken: 'figma.token',
} as const;

export type SettingKey = (typeof SettingKey)[keyof typeof SettingKey];

export const SETTING_KEYS: SettingKey[] = Object.values(SettingKey);

const SECRET_KEYS = new Set<SettingKey>([SettingKey.figmaToken]);

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<SettingResponseDto[]> {
    const settings = await this.prisma.setting.findMany({
      where: { key: { in: SETTING_KEYS } },
    });
    const byKey = new Map(settings.map((item) => [item.key, item]));

    return SETTING_KEYS.map((key) => {
      const setting = byKey.get(key);
      return this.toResponse(
        key,
        setting?.value ?? null,
        setting?.updatedAt ?? null,
      );
    });
  }

  async get(key: SettingKey): Promise<string | null> {
    const setting = await this.prisma.setting.findUnique({ where: { key } });
    return setting?.value ?? null;
  }

  async set(key: string, value: string): Promise<SettingResponseDto> {
    const settingKey = this.parseKey(key);
    const normalized = value.trim();
    if (!normalized) {
      throw new BadRequestException('Значение не может быть пустым');
    }

    const setting = await this.prisma.setting.upsert({
      where: { key: settingKey },
      create: { key: settingKey, value: normalized },
      update: { value: normalized },
    });

    return this.toResponse(settingKey, setting.value, setting.updatedAt);
  }

  private parseKey(key: string): SettingKey {
    if (!SETTING_KEYS.includes(key as SettingKey)) {
      throw new NotFoundException('Настройка не найдена');
    }

    return key as SettingKey;
  }

  private toResponse(
    key: SettingKey,
    value: string | null,
    updatedAt: Date | null,
  ): SettingResponseDto {
    return {
      key,
      value: value && SECRET_KEYS.has(key) ? this.mask(value) : value,
      updatedAt,
    };
  }

  private mask(value: string): string {
    if (value.length <= 8) {
      return '****';
    }

    return `${value.slice(0, 5)}****${value.slice(-4)}`;
  }
}
