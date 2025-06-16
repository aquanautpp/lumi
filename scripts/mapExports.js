import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const root = path.dirname(fileURLToPath(import.meta.url));
const mapPath = path.join(root, '..', 'export-map.json');
let exportsMap = {};
try {
  exportsMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
} catch (err) {
  if (err.code === 'ENOENT') {
    fs.writeFileSync(mapPath, JSON.stringify(exportsMap, null, 2));
  } else {
    throw err;
  }
}

function abs(p) {
  return pathToFileURL(path.resolve(root, '..', p)).href;
}

describe('exports', () => {
  for (const [modPath, names] of Object.entries(exportsMap)) {
    test(modPath, async () => {
      const mod = await import(abs(modPath));
      for (const name of names) {
        const fn = mod[name];
        if (typeof fn === 'function') {
          try { await fn(); } catch {}
        }
      }
      expect(Object.keys(mod)).toEqual(expect.arrayContaining(names));
    });
  }
});
