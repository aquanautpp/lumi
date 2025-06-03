import fs from 'fs';
import dotenv from 'dotenv';
import { enviarMensagemWhatsApp } from './whatsapp.js';

dotenv.config();

const MEMORIA_PATH = process.env.JSON_PATH || 'memoria.json';
const DESAFIOS_PATH = 'desafiosPendentes.json';
const MISSOES_PATH = 'missoesPendentes.json';

export const memoriaUsuarios = {};
export const desafiosPendentes = {};
export const missoesPendentes = {};

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
  if (fs.existsSync(MISSOES_PATH)) {
    const missoes = JSON.parse(fs.readFileSync(MISSOES_PATH));
    Object.assign(missoesPendentes, missoes);
    console.log('✅ Missões pendentes carregadas.');
  }
}

export function salvarMemoria() {
  fs.writeFileSync(MEMORIA_PATH, JSON.stringify(memoriaUsuarios, null, 2));
  fs.writeFileSync(DESAFIOS_PATH, JSON.stringify(desafiosPendentes, null, 2));
  fs.writeFileSync(MISSOES_PATH, JSON.stringify(missoesPendentes, null, 2));
}

export function atualizarMemoria(numero, categoria, acertou, respostaUsuario, respostaCorreta) {
  const usuario = memoriaUsuarios[numero] || { historico: [] };
  const hoje = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  usuario.historico = usuario.historico || [];
  usuario.historico.push({
    data: hoje,
    categoria,
    acertou,
    respostaUsuario,
    respostaCorreta
  });

  memoriaUsuarios[numero] = usuario;
  salvarMemoria();
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
