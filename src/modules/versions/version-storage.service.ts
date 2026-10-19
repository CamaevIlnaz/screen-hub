import { BadRequestException, Injectable } from '@nestjs/common';
import { Storage } from '../../storage/storage';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';

const ALLOWED_MIME_TO_EXT: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
};

const ALLOWED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg']);

export type UploadedVersionFile = {
  buffer: Buffer;
  filename: string;
  mimetype: string;
};

@Injectable()
export class VersionStorageService {
  constructor(private readonly storage: Storage) {}

  async saveVersionFile(
    frameId: number,
    versionNumber: number,
    file: UploadedVersionFile,
  ): Promise<string> {
    const ext = this.resolveExtension(file);
    const relativePath = `frames/${frameId}/versions/${versionNumber}-${randomUUID()}${ext}`;
    await this.storage.write(relativePath, file.buffer);

    return relativePath;
  }

  async deleteFile(relativePath: string | null | undefined): Promise<void> {
    if (relativePath) await this.storage.delete(relativePath);
  }

  private resolveExtension(file: UploadedVersionFile): string {
    const fromMime = ALLOWED_MIME_TO_EXT[file.mimetype];
    if (fromMime) {
      return fromMime;
    }

    const fromName = extname(file.filename).toLowerCase();
    if (ALLOWED_EXTENSIONS.has(fromName)) {
      return fromName === '.jpeg' ? '.jpg' : fromName;
    }

    throw new BadRequestException(
      'Недопустимый тип файла. Разрешены: png, jpg, webp, svg',
    );
  }
}
