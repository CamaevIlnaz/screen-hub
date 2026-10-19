import { Storage } from './storage/storage';
import { registerUploadsRoute } from './storage/uploads-route';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import fastifyCookie from '@fastify/cookie';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3000);
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api');
  const swaggerPath = configService.get<string>('app.swaggerPath', 'docs');
  const corsOrigin = configService.get<string>(
    'app.corsOrigin',
    'http://localhost:5173',
  );
  const cookieName = configService.get<string>(
    'app.cookieName',
    'access_token',
  );
  const uploadsPath = resolve(
    process.cwd(),
    configService.get<string>('app.uploadsDir', 'uploads'),
  );
  const publicPath = resolve(
    process.cwd(),
    configService.get<string>('app.publicDir', 'public'),
  );

  await app.register(fastifyCookie);
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 20 * 1024 * 1024,
      files: 1,
    },
  });

  if (configService.get<boolean>('sftp.enabled')) {
    registerUploadsRoute(app.getHttpAdapter().getInstance(), app.get(Storage));
  } else {
    if (!existsSync(uploadsPath)) mkdirSync(uploadsPath, { recursive: true });
    await app.register(fastifyStatic, {
      root: uploadsPath,
      prefix: '/uploads/',
      decorateReply: false,
    });
  }

  const publicIndex = join(publicPath, 'index.html');
  if (existsSync(publicIndex)) {
    await app.register(fastifyStatic, {
      root: publicPath,
      wildcard: false,
    });

    const fastify = app.getHttpAdapter().getInstance();
    fastify.setNotFoundHandler((request, reply) => {
      const url = request.url.split('?')[0] ?? '';
      const isApi =
        url.startsWith(`/${apiPrefix}`) ||
        url.startsWith('/uploads') ||
        url.startsWith(`/${swaggerPath}`);

      if (isApi || url.includes('.')) {
        return reply.status(404).send({
          statusCode: 404,
          message: 'Not Found',
        });
      }

      return reply.sendFile('index.html');
    });
  }

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.setGlobalPrefix(apiPrefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('screen-hub')
    .setDescription('API backend для сервиса просмотра дизайн-макетов')
    .setVersion('0.1.0')
    .addCookieAuth(cookieName)
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(swaggerPath, app, document);

  await app.listen(port, '0.0.0.0');
}

void bootstrap();
