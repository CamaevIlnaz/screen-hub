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

export type UploadedProjectFile = {
  buffer: Buffer;
  filename: string;
  mimetype: string;
};

@Injectable()
export class ProjectStorageService {
  constructor(private readonly storage: Storage) {}

  async savePreview(
    projectId: number,
    file: UploadedProjectFile,
  ): Promise<string> {
    const ext = this.resolveExtension(file);
    const relativePath = `projects/${projectId}/preview-${randomUUID()}${ext}`;
    await this.storage.write(relativePath, file.buffer);

    return relativePath;
  }

  async deleteFile(relativePath: string | null | undefined): Promise<void> {
    if (relativePath) await this.storage.delete(relativePath);
  }

  private resolveExtension(file: UploadedProjectFile): string {
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
