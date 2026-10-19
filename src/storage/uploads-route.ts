import type { FastifyInstance } from 'fastify';
import { extname } from 'node:path';
import { Storage, storageError } from './storage';

const mime: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

export function registerUploadsRoute(app: FastifyInstance, storage: Storage) {
  app.route<{ Params: { '*': string } }>({
    method: ['GET', 'HEAD'],
    url: '/uploads/*',
    handler: async (request, reply) => {
      try {
        const key = request.params['*'];
        const file = await storage.read(key, request.method === 'HEAD');
        reply.type(
          mime[extname(key).toLowerCase()] ?? 'application/octet-stream',
        );
        reply.header('Content-Length', file.size);
        if (file.stream) {
          const stream = file.stream;
          const cancel = () => stream.destroy();
          reply.raw.once('close', cancel);
          stream.once('close', () => reply.raw.off('close', cancel));
          if (reply.raw.destroyed) stream.destroy();
          return reply.send(stream);
        }
        return reply.send();
      } catch (error) {
        const mapped = storageError(error);
        return reply.status(mapped.getStatus()).send(mapped.getResponse());
      }
    },
  });
}
