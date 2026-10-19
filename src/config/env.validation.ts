import { plainToInstance, Type } from 'class-transformer';
import { accessSync, constants, statSync } from 'node:fs';
import { posix } from 'node:path';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
  validateSync,
} from 'class-validator';

export class EnvironmentVariables {
  @IsOptional()
  @IsString()
  NODE_ENV?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  PORT?: number;

  @IsOptional()
  @IsString()
  API_PREFIX?: string;

  @IsOptional()
  @IsString()
  SWAGGER_PATH?: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsOptional()
  @IsString()
  JWT_EXPIRES_IN?: string;

  @IsOptional()
  @IsString()
  COOKIE_NAME?: string;

  @IsOptional()
  @IsString()
  CORS_ORIGIN?: string;

  @IsOptional()
  @IsString()
  UPLOADS_DIR?: string;

  @IsOptional()
  @IsString()
  PUBLIC_DIR?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  FIGMA_TOKEN_SETTING_KEY?: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'FIGMA_SYNC_TIME должен быть в формате HH:mm',
  })
  FIGMA_SYNC_TIME?: string;
}

function assertBooleanFlag(config: Record<string, unknown>, key: string): void {
  if (
    config[key] !== undefined &&
    config[key] !== 'true' &&
    config[key] !== 'false'
  ) {
    throw new Error(`${key} должен быть true или false`);
  }
}

export function validateEnv(config: Record<string, unknown>) {
  assertBooleanFlag(config, 'SFTP_ENABLED');
  assertBooleanFlag(config, 'FIGMA_SYNC_ENABLED');
  if (config.SFTP_ENABLED === 'true') {
    for (const key of [
      'SFTP_HOST',
      'SFTP_USERNAME',
      'SFTP_PRIVATE_KEY_PATH',
      'SFTP_ROOT',
    ]) {
      if (typeof config[key] !== 'string' || !config[key].trim())
        throw new Error(`Не задан ${key}`);
    }
    for (const [key, fallback, max] of [
      ['SFTP_PORT', 22, 65535],
      ['SFTP_READY_TIMEOUT_MS', 20000, 2147483647],
    ] as const) {
      const value = Number(config[key] ?? fallback);
      if (!Number.isInteger(value) || value < 1 || value > max)
        throw new Error(`Некорректный ${key}`);
    }
    const root = config.SFTP_ROOT as string;
    if (
      !posix.isAbsolute(root) ||
      root.includes('\\') ||
      root.includes('\0') ||
      root.split('/').includes('..')
    )
      throw new Error('SFTP_ROOT должен быть абсолютным POSIX-путём');
    try {
      const keyPath = config.SFTP_PRIVATE_KEY_PATH as string;
      accessSync(keyPath, constants.R_OK);
      if (!statSync(keyPath).isFile()) throw new Error();
    } catch {
      throw new Error(
        'SFTP_PRIVATE_KEY_PATH должен указывать на доступный файл ключа',
      );
    }
  }
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, {
    skipMissingProperties: false,
    whitelist: true,
    forbidNonWhitelisted: false,
  });

  if (errors.length > 0) {
    const messages = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('; ');
    throw new Error(`Некорректные переменные окружения: ${messages}`);
  }

  return config;
}
