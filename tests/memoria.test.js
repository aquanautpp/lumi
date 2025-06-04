import fs from 'fs/promises';

const TMP_DIR = 'tmp';
const MEM_FILE = `${TMP_DIR}/test_memoria.json`;
process.env.JSON_PATH = MEM_FILE;

let memoriaUsuarios, alternarModoSussurro, salvarMemoria;

beforeAll(async () => {
  await fs.mkdir(TMP_DIR, { recursive: true });
  const mod = await import('../utils/memoria.js');
  memoriaUsuarios = mod.memoriaUsuarios;
  alternarModoSussurro = mod.alternarModoSussurro;
  salvarMemoria = mod.salvarMemoria;
});

afterEach(async () => {
  try { await fs.unlink(MEM_FILE); } catch {}
  try { await fs.unlink('desafiosPendentes.json'); } catch {}
  try { await fs.unlink('missoesPendentes.json'); } catch {}
});

test('alternarModoSussurro toggles state', async () => {
  const numero = '123';
  memoriaUsuarios[numero] = {};
  await alternarModoSussurro(numero);
  expect(memoriaUsuarios[numero].modoSussurro).toBe(true);
  await alternarModoSussurro(numero);
  expect(memoriaUsuarios[numero].modoSussurro).toBe(false);
});

test('salvarMemoria persists data', async () => {
  const numero = '321';
  memoriaUsuarios[numero] = { nome: 'Teste' };
  await salvarMemoria();
  const conteudo = JSON.parse(await fs.readFile(MEM_FILE, 'utf-8'));
  expect(conteudo[numero].nome).toBe('Teste');
});
