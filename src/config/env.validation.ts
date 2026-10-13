import { plainToInstance, Type } from 'class-transformer';
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
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'FIGMA_SYNC_TIME должен быть в формате HH:mm',
  })
  FIGMA_SYNC_TIME?: string;
}

export function validateEnv(config: Record<string, unknown>) {
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
