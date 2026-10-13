import { BadRequestException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { UploadedProjectFile } from './project-storage.service';

export type ProjectMultipartPayload = {
  name?: string;
  description?: string;
  figmaId?: string;
  figmaLink?: string;
  preview?: UploadedProjectFile;
};

export async function parseProjectMultipart(
  request: FastifyRequest,
): Promise<ProjectMultipartPayload> {
  const payload: ProjectMultipartPayload = {};

  try {
    const parts = request.parts();

    for await (const part of parts) {
      if (part.type === 'file') {
        if (part.fieldname !== 'preview') {
          continue;
        }

        const buffer = await part.toBuffer();
        if (!buffer.length) {
          throw new BadRequestException('Файл превью пустой');
        }

        payload.preview = {
          buffer,
          filename: part.filename,
          mimetype: part.mimetype,
        };
        continue;
      }

      const value = String(part.value ?? '').trim();
      if (!value) {
        continue;
      }

      if (part.fieldname === 'name') {
        payload.name = value;
      } else if (part.fieldname === 'description') {
        payload.description = value;
      } else if (part.fieldname === 'figmaId') {
        payload.figmaId = value;
      } else if (part.fieldname === 'figmaLink') {
        payload.figmaLink = value;
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
