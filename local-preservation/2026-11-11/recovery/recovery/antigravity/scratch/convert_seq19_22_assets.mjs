import sharp from 'file:///C:/Users/jbseo/Desktop/lost-dreams-novel/vn/node_modules/sharp/lib/index.js';
import path from 'node:path';

const brainDir = 'C:/Users/jbseo/.gemini/antigravity-cli/brain/e2d8e107-51da-4d48-ac0c-d7e6ea1487ac';
const outDir = 'C:/Users/jbseo/Desktop/lost-dreams-novel/vn/assets';

// First inspect existing yoonha.webp metadata
const refMeta = await sharp(path.join(outDir, 'yoonha.webp')).metadata();
console.log('Reference yoonha.webp:', { width: refMeta.width, height: refMeta.height, channels: refMeta.channels, hasAlpha: refMeta.hasAlpha });

const jobs = [
  { src: 'yoonsera_1792373150916.jpg', dest: 'yoonsera.webp' },
  { src: 'eunkyung_1792373178657.jpg', dest: 'eunkyung.webp' },
  { src: 'haerin_1792373224978.jpg', dest: 'haerin.webp' },
];

async function removeWhiteBgAndSave(inputPath, outputPath, targetWidth, targetHeight) {
  const { data, info } = await sharp(inputPath)
    .resize(targetWidth, targetHeight, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0, tail = 0;

  const isBg = (idx) => {
    const o = idx * channels;
    const r = data[o], g = data[o + 1], b = data[o + 2];
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    return r >= 236 && g >= 236 && b >= 236 && (max - min) <= 18;
  };

  const enqueue = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const idx = y * width + x;
    if (visited[idx] || !isBg(idx)) return;
    visited[idx] = 1;
    queue[tail++] = idx;
  };

  for (let x = 0; x < width; x++) { enqueue(x, 0); enqueue(x, height - 1); }
  for (let y = 0; y < height; y++) { enqueue(0, y); enqueue(width - 1, y); }

  while (head < tail) {
    const idx = queue[head++];
    const x = idx % width;
    const y = (idx - x) / width;
    data[idx * channels + 3] = 0;
    enqueue(x - 1, y);
    enqueue(x + 1, y);
    enqueue(x, y - 1);
    enqueue(x, y + 1);
  }

  // Feather 1px border around transparent pixels
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (visited[idx]) continue;
      const n = visited[idx - 1] + visited[idx + 1] + visited[idx - width] + visited[idx + width];
      if (n > 0) {
        const o = idx * channels;
        const lum = (data[o] + data[o + 1] + data[o + 2]) / 3;
        if (lum > 220) {
          data[o + 3] = Math.round(255 * Math.max(0.15, (255 - lum) / 40));
        }
      }
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .webp({ quality: 86, alphaQuality: 90 })
    .toFile(outputPath);

  const stat = await sharp(outputPath).metadata();
  console.log('Saved:', path.basename(outputPath), { width: stat.width, height: stat.height, hasAlpha: stat.hasAlpha });
}

for (const job of jobs) {
  await removeWhiteBgAndSave(
    path.join(brainDir, job.src),
    path.join(outDir, job.dest),
    refMeta.width || 896,
    refMeta.height || 1344,
  );
}
