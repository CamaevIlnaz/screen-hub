import {
  BadRequestException,
  HttpException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { posix } from 'node:path';
import type { Readable } from 'node:stream';

export interface StoredFile {
  size: number;
  stream?: Readable;
}
export abstract class Storage {
  abstract write(key: string, data: Buffer): Promise<void>;
  abstract read(key: string, head?: boolean): Promise<StoredFile>;
  abstract delete(key: string): Promise<void>;
}

export function validateKey(key: string): string {
  if (
    !key ||
    key.includes('\\') ||
    key.includes('\0') ||
    key.includes(':') ||
    posix.isAbsolute(key) ||
    key.split('/').some((part) => !part || part === '.' || part === '..')
  ) {
    throw new BadRequestException('Недопустимый путь файла');
  }
  return key;
}

export function missing(error: unknown): boolean {
  const code = (error as { code?: string | number })?.code;
  return code === 'ENOENT' || code === 2;
}

export function storageError(
  error: unknown,
): HttpException & { statusCode: number } {
  const mapped =
    error instanceof BadRequestException || error instanceof NotFoundException
      ? error
      : missing(error)
        ? new NotFoundException('Файл не найден')
        : new ServiceUnavailableException('Файловое хранилище недоступно');
  return Object.assign(mapped, { statusCode: mapped.getStatus() });
}
