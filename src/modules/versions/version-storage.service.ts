import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';

const ALLOWED_MIME_TO_EXT: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
};

const ALLOWED_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.svg',
]);

export type UploadedVersionFile = {
  buffer: Buffer;
  filename: string;
  mimetype: string;
};

@Injectable()
export class VersionStorageService {
  private readonly uploadsRoot: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadsRoot = resolve(
      process.cwd(),
      this.configService.get<string>('app.uploadsDir', 'uploads'),
    );
  }

  saveVersionFile(
    frameId: number,
    versionNumber: number,
    file: UploadedVersionFile,
  ): string {
    const ext = this.resolveExtension(file);
    const relativePath = `frames/${frameId}/versions/${versionNumber}${ext}`;
    const absolutePath = join(this.uploadsRoot, relativePath);

    mkdirSync(dirname(absolutePath), { recursive: true });
    writeFileSync(absolutePath, file.buffer);

    return relativePath;
  }

  deleteFile(relativePath: string | null | undefined): void {
    if (!relativePath) {
      return;
    }

    const absolutePath = join(this.uploadsRoot, relativePath);
    if (!existsSync(absolutePath)) {
      return;
    }

    unlinkSync(absolutePath);
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
