import { BadRequestException } from '@nestjs/common';
import SftpClient from 'ssh2-sftp-client';
import { posix } from 'node:path';
import { PassThrough } from 'node:stream';
import {
  Storage,
  StoredFile,
  missing,
  storageError,
  validateKey,
} from './storage';

export class SftpStorage extends Storage {
  private active = 0;
  private readonly waiting: Array<() => void> = [];

  constructor(
    private readonly options: SftpClient.ConnectOptions,
    private readonly root: string,
  ) {
    super();
  }

  private async connect() {
    if (this.active >= 4)
      await new Promise<void>((resolve) => this.waiting.push(resolve));
    else this.active++;
    const client = new SftpClient();
    let closed = false;
    const close = async () => {
      if (closed) return;
      closed = true;
      try {
        await client.end();
      } catch {
        /* Preserve the operation error. */
      } finally {
        const next = this.waiting.shift();
        if (next) next();
        else this.active--;
      }
    };
    try {
      await client.connect(this.options);
    } catch (error) {
      await close();
      throw storageError(error);
    }
    return { client, close };
  }

  private async path(client: SftpClient, key: string, create = false) {
    validateKey(key);
    const root = posix.resolve(this.root);
    // Check every component, including the configured root, before following it.
    let current = '/';
    const parts = posix.join(root, key).split('/').filter(Boolean);
    for (let i = 0; i < parts.length; i++) {
      current = posix.join(current, parts[i]);
      const type = await client.exists(current);
      if (type === 'l')
        throw new BadRequestException('Ссылки в хранилище запрещены');
      if (i < parts.length - 1) {
        if (!type && create) {
          try {
            await client.mkdir(current);
          } catch (error) {
            if ((await client.exists(current)) !== 'd') throw error;
          }
        } else if (type && type !== 'd')
          throw new BadRequestException('Недопустимый каталог');
      }
    }
    return posix.join(root, key);
  }

  async write(key: string, data: Buffer): Promise<void> {
    validateKey(key);
    const { client, close } = await this.connect();
    let path: string | undefined;
    let attempted = false;
    try {
      path = await this.path(client, key, true);
      if (await client.exists(path))
        throw new BadRequestException('Файл уже существует');
      attempted = true;
      await client.put(data, path);
    } catch (error) {
      if (attempted && path) {
        try {
          await client.delete(path, true);
        } catch {
          /* Connection may be lost. */
        }
      }
      throw storageError(error);
    } finally {
      await close();
    }
  }

  async read(key: string, head = false): Promise<StoredFile> {
    validateKey(key);
    const { client, close } = await this.connect();
    try {
      const path = await this.path(client, key);
      const info = await client.stat(path);
      if (!info.isFile) throw new BadRequestException('Ожидался файл');
      if (head) {
        await close();
        return { size: info.size };
      }
      const stream = new PassThrough();
      stream.on('error', () => {
        void close();
      });
      stream.once('close', () => {
        void close();
      });
      stream.once('end', () => {
        void close();
      });
      void client
        .get(path, stream)
        .catch((error) => stream.destroy(storageError(error)))
        .finally(close);
      return { size: info.size, stream };
    } catch (error) {
      await close();
      throw storageError(error);
    }
  }

  async delete(key: string): Promise<void> {
    validateKey(key);
    const { client, close } = await this.connect();
    try {
      await client.delete(await this.path(client, key), true);
    } catch (error) {
      if (!missing(error)) throw storageError(error);
    } finally {
      await close();
    }
  }
}
