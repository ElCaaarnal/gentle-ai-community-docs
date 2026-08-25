import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const source = path.join(root, 'assets', 'banner-source.webp');
const output = path.join(root, 'public', 'banner.webp');
const sourceHash = '22f2ea7a3a4e360c634b5c9147d6b2f924fd5ae5cc18857be13248a133077df9';

const sha256 = async (file) => createHash('sha256').update(await readFile(file)).digest('hex');

if (!(await stat(source).catch(() => null))) {
  if ((await sha256(output)) !== sourceHash) throw new Error('Missing banner source asset. Restore assets/banner-source.webp.');
  await mkdir(path.dirname(source), { recursive: true });
  await copyFile(output, source);
}

if ((await sha256(source)) !== sourceHash) throw new Error('Banner source SHA-256 does not match the approved asset.');

const banner = await sharp(source)
  .extract({ left: 0, top: 120, width: 1672, height: 720 })
  .resize(1600, 689)
  .webp({ quality: 82, effort: 6 })
  .toBuffer();
const metadata = await sharp(banner).metadata();

if (metadata.width !== 1600 || metadata.height !== 689) throw new Error('Banner output dimensions are invalid.');
if (banner.length > 100 * 1024) throw new Error('Banner output exceeds 100 KiB.');

await writeFile(output, banner);
console.log(`Generated public/banner.webp (${banner.length} bytes, sha256:${createHash('sha256').update(banner).digest('hex')}).`);
