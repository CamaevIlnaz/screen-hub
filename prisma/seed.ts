import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role, UploadType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { copyFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL не задан');
}

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const uploadsRoot = resolve(
  process.cwd(),
  process.env.UPLOADS_DIR ?? 'uploads',
);
const seedImage = resolve(__dirname, 'seed-assets/preview.png');

function writeUpload(relativePath: string): string {
  const absolutePath = join(uploadsRoot, relativePath);
  mkdirSync(dirname(absolutePath), { recursive: true });
  copyFileSync(seedImage, absolutePath);
  return relativePath;
}

async function seedAdmin() {
  const passwordHash = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.upsert({
    where: { login: 'ikamaev' },
    update: {
      passwordHash,
      name: 'IKamaev',
      role: Role.admin,
    },
    create: {
      login: 'ikamaev',
      passwordHash,
      name: 'IKamaev',
      role: Role.admin,
    },
  });

  console.log(`- админ: ${admin.login} (id=${admin.id})`);
}

async function main() {
  await seedAdmin();

  await prisma.version.deleteMany();
  await prisma.frame.deleteMany();
  await prisma.group.deleteMany();
  await prisma.section.deleteMany();
  await prisma.project.deleteMany();

  rmSync(join(uploadsRoot, 'projects'), { recursive: true, force: true });
  rmSync(join(uploadsRoot, 'frames'), { recursive: true, force: true });

  const project = await prisma.project.create({
    data: {
      name: 'Design Viewer',
      description: 'Тестовый проект с дизайн-макетами',
      figmaId: 'AbCdEfGhIjKlMnOpQrSt',
    },
  });

  const preview = writeUpload(`projects/${project.id}/preview.png`);
  await prisma.project.update({
    where: { id: project.id },
    data: { preview },
  });

  const projectMobile = await prisma.project.create({
    data: {
      name: 'Mobile App',
      description: 'Мобильное приложение: онбординг и основной поток',
      figmaId: 'XyZaBcDeFgHiJkLmNoPq',
    },
  });

  const previewMobile = writeUpload(
    `projects/${projectMobile.id}/preview.png`,
  );
  await prisma.project.update({
    where: { id: projectMobile.id },
    data: { preview: previewMobile },
  });

  const sectionAuth = await prisma.section.create({
    data: {
      projectId: project.id,
      name: 'Авторизация',
      description: 'Экраны входа и регистрации',
      figmaId: '1:10',
    },
  });

  const sectionProfile = await prisma.section.create({
    data: {
      projectId: project.id,
      name: 'Профиль',
      description: 'Личный кабинет пользователя',
      figmaId: '1:20',
    },
  });

  const groupLogin = await prisma.group.create({
    data: {
      sectionId: sectionAuth.id,
      name: 'Вход',
      description: 'Формы входа',
      figmaId: '2:11',
    },
  });

  const groupSettings = await prisma.group.create({
    data: {
      sectionId: sectionProfile.id,
      name: 'Настройки',
      description: 'Настройки профиля',
      figmaId: '2:21',
    },
  });

  const frameLogin = await prisma.frame.create({
    data: {
      groupId: groupLogin.id,
      name: 'Экран входа',
      description: 'Основная форма авторизации',
      figmaId: '3:111',
    },
  });

  const framePasswordReset = await prisma.frame.create({
    data: {
      groupId: groupLogin.id,
      name: 'Восстановление пароля',
      description: 'Запрос ссылки для сброса пароля',
      figmaId: '3:112',
    },
  });

  await prisma.frame.create({
    data: {
      groupId: groupSettings.id,
      name: 'Редактирование профиля',
      description: 'Изменение имени и аватара',
      figmaId: '3:211',
    },
  });

  await prisma.frame.create({
    data: {
      groupId: groupSettings.id,
      name: 'Уведомления',
      description: 'Настройки уведомлений',
      figmaId: '3:212',
    },
  });

  const versionDescriptions = [
    'Первая версия макета',
    'Обновлены отступы и типографика',
    'Актуальная версия для ревью',
  ];

  for (let i = 0; i < versionDescriptions.length; i += 1) {
    const versionNumber = i + 1;
    const filename = writeUpload(
      `frames/${frameLogin.id}/versions/${versionNumber}.png`,
    );

    await prisma.version.create({
      data: {
        frameId: frameLogin.id,
        version: versionNumber,
        description: versionDescriptions[i],
        filename,
        uploadType: UploadType.manual,
      },
    });
  }

  const passwordResetFilename = writeUpload(
    `frames/${framePasswordReset.id}/versions/1.png`,
  );
  await prisma.version.create({
    data: {
      frameId: framePasswordReset.id,
      version: 1,
      description: 'Первая версия макета',
      filename: passwordResetFilename,
      uploadType: UploadType.manual,
    },
  });

  console.log('Seed выполнен:');
  console.log(`- проект #${project.id}: ${project.name}`);
  console.log(`- проект #${projectMobile.id}: ${projectMobile.name}`);
  console.log('- разделы: 2, группы: 2, фреймы: 4');
  console.log(`- версии у фрейма «${frameLogin.name}»: 3`);
  console.log(`- версии у фрейма «${framePasswordReset.name}»: 1`);
  console.log(`- preview: ${preview}`);
  console.log(`- preview: ${previewMobile}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
