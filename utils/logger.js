import { promises as fs } from 'fs';

const LOG_DIR = '/data/logs';
const LOG_FILE = `${LOG_DIR}/errors.log`;

export async function logError(err) {
  try {
    await fs.mkdir(LOG_DIR, { recursive: true });
    const line = `[${new Date().toISOString()}] ${err.stack || err}\n`;
    await fs.appendFile(LOG_FILE, line);
  } catch (e) {
    console.error('Falha ao registrar log:', e);
  }
}
