/**
 * `npm run icons` — sinh icon PWA từ SVG linh vật Bao bằng sharp (chỉ lúc phát triển).
 * Tạo: public/icons/favicon.svg, icon-192.png, icon-512.png, maskable-512.png,
 * apple-touch-icon.png (180). Icon maskable chừa lề 20% theo vùng an toàn.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import sharp from 'sharp';
import { Bao } from '../src/components/mascot/Bao';

const OUT = fileURLToPath(new URL('../public/icons', import.meta.url));
const BG = '#E63946'; // --primary, trùng theme_color của manifest

/** Bao trên nền đỏ bo góc; `inset` = phần lề (0..0.5) để icon maskable không bị cắt. */
function iconSvg(inset: number): string {
  const size = 100 * (1 - 2 * inset);
  const offset = 100 * inset;
  const bao = renderToStaticMarkup(createElement(Bao, { mood: 'happy', size: 100 })).replace(
    /<svg[^>]*?width="100" height="100"/,
    `<svg viewBox="0 0 100 100" x="${offset}" y="${offset}" width="${size}" height="${size}"`,
  );
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
    `<rect width="100" height="100" rx="22" fill="${BG}"/>${bao}</svg>`
  );
}

const standard = Buffer.from(iconSvg(0.08));
const maskable = Buffer.from(iconSvg(0.2));
const outputs: [string, Buffer, number][] = [
  ['icon-192.png', standard, 192],
  ['icon-512.png', standard, 512],
  ['apple-touch-icon.png', standard, 180],
  ['maskable-512.png', maskable, 512],
];

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'favicon.svg'), iconSvg(0.08));
for (const [name, svg, px] of outputs) {
  await sharp(svg, { density: 384 }).resize(px, px).png().toFile(join(OUT, name));
}
console.log(`icons — favicon.svg + ${outputs.length} PNG → public/icons/`);
