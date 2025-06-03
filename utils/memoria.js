import fs from 'fs';
import dotenv from 'dotenv';
import { enviarMensagemWhatsApp } from './whatsapp.js';

dotenv.config();

const MEMORIA_PATH = process.env.JSON_PATH || 'memoria.json';
const DESAFIOS_PATH = 'desafiosPendentes.json';

export const memoriaUsuarios = {};
export const desafiosPendentes = {};

function carregarMemoria() {
  if (fs.existsSync(MEMORIA_PATH)) {
    const dados = JSON.parse(fs.readFileSync(MEMORIA_PATH));
    Object.assign(memoriaUsuarios, dados);
    console.log('✅ Memória dos usuários carregada.');
  }
  if (fs.existsSync(DESAFIOS_PATH)) {
    const desafios = JSON.parse(fs.readFileSync(DESAFIOS_PATH));
    Object.assign(desafiosPendentes, desafios);
    console.log('✅ Desafios pendentes carregados.');
  }
}

export function salvarMemoria() {
  fs.writeFileSync(MEMORIA_PATH, JSON.stringify(memoriaUsuarios, null, 2));
  fs.writeFileSync(DESAFIOS_PATH, JSON.stringify(desafiosPendentes, null, 2));
}

carregarMemoria();

export async function alternarModoSussurro(numero, ativar) {
  if (!memoriaUsuarios[numero]) {
    memoriaUsuarios[numero] = {};
  }
  memoriaUsuarios[numero].modoSussurro = ativar;
  salvarMemoria();
  const status = ativar ? "ativado" : "desativado";
  await enviarMensagemWhatsApp(numero, `Modo sussurro ${status}.`);
}
