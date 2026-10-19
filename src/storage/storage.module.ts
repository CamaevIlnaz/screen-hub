import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Storage } from './storage';
import { LocalStorage } from './local-storage';
import { SftpStorage } from './sftp-storage';

@Global()
@Module({
  providers: [
    {
      provide: Storage,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Storage =>
        config.get<boolean>('sftp.enabled')
          ? new SftpStorage(
              {
                host: config.getOrThrow<string>('sftp.host'),
                port: config.get<number>('sftp.port', 22),
                username: config.getOrThrow<string>('sftp.username'),
                privateKey: readFileSync(
                  config.getOrThrow<string>('sftp.privateKeyPath'),
                ),
                passphrase: config.get<string>('sftp.passphrase') || undefined,
                readyTimeout: config.get<number>('sftp.readyTimeout', 20000),
              },
              config.getOrThrow<string>('sftp.root'),
            )
          : new LocalStorage(
              resolve(config.get<string>('app.uploadsDir', 'uploads')),
            ),
    },
  ],
  exports: [Storage],
})
export class StorageModule {}
