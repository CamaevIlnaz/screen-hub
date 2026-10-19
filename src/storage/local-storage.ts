import { BadRequestException } from '@nestjs/common';
import { mkdir, lstat, writeFile, unlink, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { Storage, missing, storageError, validateKey } from './storage';

export class LocalStorage extends Storage {
  constructor(private readonly root: string) {
    super();
  }

  private async path(key: string): Promise<string> {
    validateKey(key);
    const target = resolve(this.root, key);
    let current = resolve(this.root);
    for (const part of ['', ...key.split('/')]) {
      current = join(current, part);
      try {
        if ((await lstat(current)).isSymbolicLink())
          throw new BadRequestException('Ссылки в хранилище запрещены');
      } catch (error) {
        if (!missing(error)) throw error;
      }
    }
    return target;
  }

  async write(key: string, data: Buffer): Promise<void> {
    try {
      const path = await this.path(key);
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, data, { flag: 'wx' });
    } catch (error) {
      throw storageError(error);
    }
  }

  async read(key: string, head = false) {
    try {
      const path = await this.path(key);
      const info = await stat(path);
      if (!info.isFile()) throw new BadRequestException('Ожидался файл');
      return {
        size: info.size,
        stream: head ? undefined : createReadStream(path),
      };
    } catch (error) {
      throw storageError(error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await unlink(await this.path(key));
    } catch (error) {
      if (!missing(error)) throw storageError(error);
    }
  }
}
