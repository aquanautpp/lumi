import fs from 'fs/promises';

const TMP_DIR = 'tmp';
const FILE = `${TMP_DIR}/persist.json`;

test('write and read JSON file', async () => {
  await fs.mkdir(TMP_DIR, { recursive: true });
  const data = { hello: 'world' };
  await fs.writeFile(FILE, JSON.stringify(data));
  const text = await fs.readFile(FILE, 'utf-8');
  const parsed = JSON.parse(text);
  expect(parsed).toEqual(data);
});
