import fs from 'fs/promises';
await fs.mkdir('./tmp-test', { recursive: true });
process.env.DATA_DIR = './tmp-test';
