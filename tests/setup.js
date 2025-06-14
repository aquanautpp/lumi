import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

await fs.mkdir('./tmp-test', { recursive: true });
process.env.DATA_DIR = './tmp-test';
const mapFile = path.resolve('export-map.json');
if (!existsSync(mapFile)) {
  const { spawnSync } = await import('child_process');
  spawnSync('node', ['scripts/mapExports.js'], { stdio: 'inherit' });
}
