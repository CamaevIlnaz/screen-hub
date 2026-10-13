// Тестовый скрипт для ручной проверки ответа Figma API.
// Запуск (PowerShell):
//   $env:FIGMA_TOKEN="figd_..."; node scripts/figma-test.mjs
// Результаты сохраняются в tmp/figma-test/

import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

// Ключ файла из URL: https://www.figma.com/design/<FILE_KEY>/...
const FILE_KEY = 'FoHYuys1kmEuJtk2vHGuBN';
// node-id из URL (?node-id=1-10), можно с "-" или с ":"
const SECTION_ID = '3511-1846';
// false — только дерево и ссылки на SVG, true — ещё и скачать SVG
const DOWNLOAD_SVG = true;

const TOKEN = "figd_HOX-Km77sSLYhByUVLp2p4geUiy7VNopLB29GVrH";
const API = 'https://api.figma.com/v1';
const OUTPUT_DIR = resolve(process.cwd(), 'tmp/figma-test');
const BATCH_SIZE = 50;

if (!TOKEN) {
  console.error('Не задан FIGMA_TOKEN');
  process.exit(1);
}

async function figmaGet(path, params) {
  const url = `${API}${path}?${new URLSearchParams(params)}`;
  const startedAt = Date.now();
  const response = await fetch(url, { headers: { 'X-Figma-Token': TOKEN } });
  const body = await response.text();
  console.log(`GET ${url} -> ${response.status} (${Date.now() - startedAt} мс)`);

  if (!response.ok) {
    throw new Error(`Figma API ${response.status}: ${body}`);
  }

  return JSON.parse(body);
}

function safeName(value) {
  return value.replace(/[<>:"/\\|?*]+/g, '_').trim();
}

async function main() {
  const sectionId = SECTION_ID.replace('-', ':');
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const nodesResponse = await figmaGet(`/files/${FILE_KEY}/nodes`, {
    ids: sectionId,
    depth: '2',
  });
  writeFileSync(
    join(OUTPUT_DIR, 'nodes.json'),
    JSON.stringify(nodesResponse, null, 2),
  );

  console.log('\nФайл:', nodesResponse.name);
  console.log('lastModified:', nodesResponse.lastModified);
  console.log('version:', nodesResponse.version);

  const section = nodesResponse.nodes?.[sectionId]?.document;
  if (!section) {
    throw new Error(`Нода ${sectionId} не найдена в ответе`);
  }

  console.log(`\n[${section.type}] ${section.name} (${section.id})`);

  const screens = [];
  for (const group of section.children ?? []) {
    console.log(`  [${group.type}] ${group.name} (${group.id})`);
    for (const screen of group.children ?? []) {
      console.log(`    [${screen.type}] ${screen.name} (${screen.id})`);
      screens.push({ group, screen });
    }
  }

  console.log(
    `\nГрупп: ${section.children?.length ?? 0}, скринов: ${screens.length}`,
  );

  if (screens.length === 0) {
    return;
  }

  const svgUrls = {};
  for (let i = 0; i < screens.length; i += BATCH_SIZE) {
    const ids = screens.slice(i, i + BATCH_SIZE).map(({ screen }) => screen.id);
    const imagesResponse = await figmaGet(`/images/${FILE_KEY}`, {
      ids: ids.join(','),
      format: 'svg',
    });

    if (imagesResponse.err) {
      console.error('Ошибка экспорта:', imagesResponse.err);
    }
    Object.assign(svgUrls, imagesResponse.images);
  }

  writeFileSync(
    join(OUTPUT_DIR, 'images.json'),
    JSON.stringify(svgUrls, null, 2),
  );

  if (!DOWNLOAD_SVG) {
    console.log('\nСсылки на SVG сохранены в images.json');
    return;
  }

  console.log('\nСкачивание SVG:');
  for (const { group, screen } of screens) {
    const url = svgUrls[screen.id];
    if (!url) {
      console.log(`  - ${screen.name}: нет ссылки (null)`);
      continue;
    }

    const response = await fetch(url);
    if (!response.ok) {
      console.log(`  - ${screen.name}: ошибка скачивания ${response.status}`);
      continue;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const dir = join(OUTPUT_DIR, 'svg', safeName(group.name));
    mkdirSync(dir, { recursive: true });
    const filename = `${safeName(screen.name)}_${safeName(screen.id)}.svg`;
    writeFileSync(join(dir, filename), buffer);
    console.log(`  - ${screen.name}: ${(buffer.length / 1024).toFixed(1)} КБ`);
  }

  console.log(`\nГотово: ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
