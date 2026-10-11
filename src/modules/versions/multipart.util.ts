import { BadRequestException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { UploadedVersionFile } from './version-storage.service';

export type VersionMultipartPayload = {
  file?: UploadedVersionFile;
  description?: string;
};

export async function parseVersionMultipart(
  request: FastifyRequest,
): Promise<VersionMultipartPayload> {
  const payload: VersionMultipartPayload = {};

  try {
    const parts = request.parts();

    for await (const part of parts) {
      if (part.type === 'file') {
        if (part.fieldname !== 'file') {
          continue;
        }

        const buffer = await part.toBuffer();
        if (!buffer.length) {
          throw new BadRequestException('Файл пустой');
        }

        payload.file = {
          buffer,
          filename: part.filename,
          mimetype: part.mimetype,
        };
        continue;
      }

      if (part.fieldname === 'description') {
        const value = String(part.value ?? '').trim();
        if (value) {
          payload.description = value;
        }
      }
    }
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw error;
    }

    throw new BadRequestException('Некорректный multipart-запрос');
  }

  return payload;
}
