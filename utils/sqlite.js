import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH || 'lumi.db';

let db;

export async function initDb() {
  db = await open({ filename: DB_PATH, driver: sqlite3.Database });
  await db.exec(`CREATE TABLE IF NOT EXISTS memoria (
      numero TEXT PRIMARY KEY,
      dados TEXT
  )`);
}

export async function carregar() {
  if (!db) await initDb();
  const rows = await db.all('SELECT numero, dados FROM memoria');
  const memoria = {};
  for (const r of rows) {
    try {
      memoria[r.numero] = JSON.parse(r.dados);
    } catch {
      memoria[r.numero] = {};
    }
  }
  return memoria;
}

export async function salvar(memoria) {
  if (!db) await initDb();
  const stmt = await db.prepare('INSERT OR REPLACE INTO memoria(numero,dados) VALUES (?,?)');
  await db.exec('BEGIN');
  for (const [numero,dados] of Object.entries(memoria)) {
    await stmt.run(numero, JSON.stringify(dados));
  }
  await db.exec('COMMIT');
  await stmt.finalize();
}
