import { enviarMensagemWhatsApp, enviarMidiaWhatsApp } from './whatsapp.js';
import { desafiosPendentes, salvarMemoria, memoriaUsuarios } from './memoria.js';
import { buildChoices } from './choiceBuilder.js';
import { promises as fs } from 'fs';

const arquivo = new URL('../desafios.json', import.meta.url);
const conteudo = JSON.parse(await fs.readFile(arquivo, 'utf-8'));

export const desafios = {};

for (const item of conteudo) {
  const pool = conteudo.filter(
    d => d.categoria === item.categoria && d.nivel === item.nivel && d !== item
  );
  if (!item.alternativas) {
    const { alternativas, correta } = buildChoices(item, pool);
    item.alternativas = alternativas;
    item.correta = correta;
  }
  if (!item.resposta) item.resposta = item.alternativas[item.correta];
  item.enunciado = item.pergunta;
  const cat = item.categoria === 'charadas' ? 'charada' : item.categoria;
  desafios[cat] = desafios[cat] || [];
  desafios[cat].push(item);
}

export function formatarPergunta(desafio) {
  if (!desafio.alternativas) return `🧠 Desafio:\n${desafio.enunciado}`;
  const letras = ['A', 'B', 'C', 'D', 'E'];
  const opcoes = desafio.alternativas
    .map((a, i) => `${letras[i]}) ${a}`)
    .join('\n');
  return `🧠 Desafio:\n${desafio.enunciado}\n${opcoes}`;
}
