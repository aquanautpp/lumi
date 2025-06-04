import { promises as fs } from 'fs';
import dotenv from 'dotenv';
import { enviarMensagemWhatsApp } from './whatsapp.js';

dotenv.config();

const MEMORIA_PATH = process.env.JSON_PATH || 'memoria.json';
const DESAFIOS_PATH = 'desafiosPendentes.json';
const MISSOES_PATH = 'missoesPendentes.json';

export const memoriaUsuarios = {};
export const desafiosPendentes = {};
export const missoesPendentes = {};

export async function alternarModoSussurro(numero) {
  if (!memoriaUsuarios[numero]) memoriaUsuarios[numero] = {};
  memoriaUsuarios[numero].modoSussurro = !memoriaUsuarios[numero].modoSussurro;
  await salvarMemoria();
  return memoriaUsuarios[numero].modoSussurro;
}

export function obterNome(numero) {
  return memoriaUsuarios[numero]?.nome || null;
}

export async function definirNome(numero, nome) {
  if (!memoriaUsuarios[numero]) memoriaUsuarios[numero] = {};
  memoriaUsuarios[numero].nome = nome;
  await salvarMemoria();
}

export function obterMascote(numero) {
  return memoriaUsuarios[numero]?.mascote || null;
}

export async function definirMascote(numero, mascote) {
  if (!memoriaUsuarios[numero]) memoriaUsuarios[numero] = {};
  memoriaUsuarios[numero].mascote = mascote;
  await salvarMemoria();
}

async function carregarMemoria() {
  try {
    const dados = JSON.parse(await fs.readFile(MEMORIA_PATH, 'utf-8'));
    Object.assign(memoriaUsuarios, dados);
    console.log('✅ Memória dos usuários carregada.');
   } catch (err) {
    if (err.code !== 'ENOENT') console.error('❌ Erro ao carregar memória:', err);
  }
  try {
    const desafios = JSON.parse(await fs.readFile(DESAFIOS_PATH, 'utf-8'));
    Object.assign(desafiosPendentes, desafios);
    console.log('✅ Desafios pendentes carregados.');
   } catch (err) {
    if (err.code !== 'ENOENT') console.error('❌ Erro ao carregar desafios:', err);
  }
  try {
    const missoes = JSON.parse(await fs.readFile(MISSOES_PATH, 'utf-8'));
    Object.assign(missoesPendentes, missoes);
    console.log('✅ Missões pendentes carregadas.');
   } catch (err) {
    if (err.code !== 'ENOENT') console.error('❌ Erro ao carregar missões:', err);
  }
}

export async function salvarMemoria() {
  await fs.writeFile(MEMORIA_PATH, JSON.stringify(memoriaUsuarios, null, 2));
  await fs.writeFile(DESAFIOS_PATH, JSON.stringify(desafiosPendentes, null, 2));
  await fs.writeFile(MISSOES_PATH, JSON.stringify(missoesPendentes, null, 2));
}

export async function atualizarMemoria(numero, categoria, acertou, respostaUsuario, respostaCorreta) {
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
  await salvarMemoria();
}

await carregarMemoria();
