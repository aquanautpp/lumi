import { promises as fs } from 'fs';
import path from 'path';

export default async function runSelfCheck() {
  const errors = [];

  const major = parseInt(process.versions.node.split('.')[0], 10);
  if (major < 18) {
    errors.push(`Node 18+ required (detected ${process.versions.node})`);
  }

  const memPath = process.env.JSON_PATH || 'memoria.json';
  const dir = path.dirname(memPath);
  const testFile = path.join(dir, '.selfcheck');
  try {
    await fs.mkdir(dir, { recursive: true });
    const data = { ok: true };
    await fs.writeFile(testFile, JSON.stringify(data));
    const txt = await fs.readFile(testFile, 'utf8');
    const parsed = JSON.parse(txt);
    if (!parsed.ok) throw new Error('mismatch');
    await fs.unlink(testFile);
  } catch (err) {
    errors.push(`filesystem check failed: ${err.message}`);
  }

  if (errors.length) {
    throw new Error(`Selfcheck failed: ${errors.join('; ')}`);
  }

  console.log('✅ Selfcheck passed');
}
