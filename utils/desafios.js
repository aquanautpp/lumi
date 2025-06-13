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

export function selecionarDesafioPorCategoriaEEstilo(categoria, estilo, numero) {
  const lista = desafios[categoria];
  if (!lista) return null;
  let filtrados = lista;
  filtrados = filtrados.filter(d => d.tipo !== 'visual' && d.tipo !== 'image');
  filtrados = filtrarResolvidos(filtrados, numero);
  return filtrados[Math.floor(Math.random() * filtrados.length)];
}

export function escolherDesafioPorCategoria(categoria, numero, estilo = null) {
  const lista = desafios[categoria];
  if (!lista) return null;
  let filtrados = lista;
  filtrados = filtrados.filter(d => d.tipo !== 'visual' && d.tipo !== 'image');
  filtrados = filtrarResolvidos(filtrados, numero);
  return filtrados[Math.floor(Math.random() * filtrados.length)];
}

export function gerarMissao(estilo = null, numero) {
  const categorias = ['matematica', 'logica', 'portugues', 'ciencias', 'historia'];
  const usadas = new Set();
  const missao = [];

  while (missao.length < 3 && categorias.length > 0) {
    const cat = categorias[Math.floor(Math.random() * categorias.length)];
    if (!usadas.has(cat)) {
      const desafio = escolherDesafioPorCategoria(cat, numero, estilo);
      if (desafio) {
        missao.push({ ...desafio, categoria: cat });
        usadas.add(cat);
      }
      categorias.splice(categorias.indexOf(cat), 1);
    }
  }

  return missao.length === 3 ? missao : null;
}

export async function enviarCharadaVisual(numero) {
  let desafioEncontrado = null;
  let categoriaImagem = null;
  for (const cat of Object.keys(desafios)) {
    const possivel = desafios[cat].find(d => d.tipo === 'image');
    if (possivel) {
      desafioEncontrado = possivel;
      categoriaImagem = cat;
      break;
    }
  }
  if (desafioEncontrado) {
    desafiosPendentes[numero] = { ...desafioEncontrado, categoria: categoriaImagem };
    await salvarMemoria();
    await enviarMensagemWhatsApp(numero, `🔍 Charada visual:\n\n${desafioEncontrado.enunciado}`);
    if (desafioEncontrado.midia) await enviarMidiaWhatsApp(numero, desafioEncontrado.midia, desafioEncontrado.tipo);
    return true;
  }
  await enviarMensagemWhatsApp(numero, 'Ainda não tenho uma charada visual no momento! 😕');
  return false;
}

function filtrarResolvidos(lista, numero) {
  const resolvidos = new Set(memoriaUsuarios[numero]?.resolvidos || []);
  return lista.filter(d => !resolvidos.has(d.enunciado));
}

export function registrarDesafioResolvido(numero, desafio) {
  if (!memoriaUsuarios[numero]) {
    memoriaUsuarios[numero] = { historico: [], resolvidos: [] };
  }
  const user = memoriaUsuarios[numero];
  user.resolvidos = user.resolvidos || [];
  if (!user.resolvidos.includes(desafio.enunciado)) {
    user.resolvidos.push(desafio.enunciado);
    salvarMemoria();
  }
}
