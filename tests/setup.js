import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

await fs.mkdir('./tmp-test', { recursive: true });
process.env.DATA_DIR = './tmp-test';
const mapFile = path.resolve('export-map.json');
if (!existsSync(mapFile)) {
  await fs.writeFile(mapFile, '{}');
}
