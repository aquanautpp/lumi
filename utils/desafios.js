// utils/desafios.js – versão consolidada, com lógica simplificada para crianças e melhorias visuais

import { enviarMensagemWhatsApp, enviarMidiaWhatsApp } from './whatsapp.js';
import { desafiosPendentes, salvarMemoria, memoriaUsuarios } from './memoria.js';

export const desafios = {
  matematica: [
    { enunciado: 'Quanto é 7 x 6?', resposta: '42', tipo: 'narrativo' },
    { enunciado: 'Qual é o dobro de 5?', resposta: '10', tipo: 'visual' },
    { enunciado: 'Se você tem 12 balas e come 5, quantas sobram?', resposta: '7', tipo: 'auditivo' },
    { enunciado: 'Quanto é 10 - 4?', resposta: '6', tipo: 'visual' },
    { enunciado: 'Quanto é a metade de 20?', resposta: '10', tipo: 'visual' },
    { enunciado: 'Quantos lados tem um quadrado?', resposta: '4', tipo: 'auditivo' }
  ],
  logica: [
    { enunciado: '🟩🟨🟨 = 7. Quanto vale 🟩?', resposta: '3', tipo: 'visual' },
    { enunciado: '🐶🐶🐱 = 9. Se 🐱 = 3, quanto vale 🐶?', resposta: '3', tipo: 'visual' },
    { enunciado: '👟👟 + 🎒 = 5. Se 🎒 = 3, quanto vale 👟?', resposta: '1', tipo: 'visual' },
    { enunciado: 'João tem 2 pares de meias. Quantas meias ele tem?', resposta: '4', tipo: 'visual' },
    {
      enunciado: '🧠 Pedro vê 5 pássaros numa árvore. Ele atira em 1. Quantos pássaros continuam lá?',
      resposta: '0',
      tipo: 'narrativo'
    }
  ],
  portugues: [
    { enunciado: 'Qual é o plural de "cão"?', resposta: 'cães', tipo: 'visual' },
    { enunciado: 'Qual é o contrário de "grande"?', resposta: 'pequeno', tipo: 'auditivo' },
    { enunciado: 'Como se escreve "arroz": com Z ou S?', resposta: 'z', tipo: 'narrativo' },
     { enunciado: 'Qual é o aumentativo de "casa"?', resposta: 'casarão', tipo: 'visual' },
    { enunciado: 'Qual é a forma correta: coração ou coraçao?', resposta: 'coração', tipo: 'narrativo' },
    { enunciado: 'Diga um sinônimo de "alegre"', resposta: 'feliz', tipo: 'auditivo' },
    { enunciado: 'Complete: "Minha família ____ reunida hoje"', resposta: 'está', tipo: 'visual' },
    { enunciado: 'Quem é o sujeito em "A menina leu um livro"?', resposta: 'a menina', tipo: 'narrativo' },
    { enunciado: 'Quem é o personagem principal da história "Chapeuzinho Vermelho"?', resposta: 'chapeuzinho vermelho', tipo: 'visual' }
  ],
  ciencias: [
    { enunciado: 'Qual órgão bombeia o sangue pelo corpo?', resposta: 'coração', tipo: 'narrativo' },
    { enunciado: 'Em qual estado da matéria está o gelo?', resposta: 'sólido', tipo: 'visual' },
    { enunciado: 'Que animal é conhecido como rei da selva?', resposta: 'leão', tipo: 'auditivo' },
    { enunciado: 'Qual vitamina encontramos na laranja?', resposta: 'c', tipo: 'visual' },
    { enunciado: 'Reciclar papel ajuda a salvar qual recurso natural?', resposta: 'árvores', tipo: 'narrativo' }
  ],
  historia: [
    { enunciado: 'Entre quais anos o Brasil foi colônia de Portugal?', resposta: '1500 a 1822', tipo: 'narrativo' },
    { enunciado: 'Quem foi o primeiro presidente do Brasil?', resposta: 'deodoro da fonseca', tipo: 'visual' },
    { enunciado: 'Quantos anos tem um século?', resposta: '100', tipo: 'auditivo' },
    { enunciado: 'O que celebramos em 7 de Setembro?', resposta: 'independência do brasil', tipo: 'visual' },
    { enunciado: 'Qual civilização construiu as pirâmides de Gizé?', resposta: 'egito antigo', tipo: 'narrativo' }
  ],
  charada: [
    { enunciado: '🍎 + 🍎 + 🍌 = 14. Quanto vale cada fruta?', resposta: 'maçã=5, banana=4', tipo: 'visual' },
    { enunciado: 'Tenho dentes mas não mordo. O que sou?', resposta: 'pente', tipo: 'auditivo' },
    { enunciado: 'Sou alto quando jovem e baixo quando velho. O que sou?', resposta: 'vela', tipo: 'cinestesico' },
    { enunciado: 'Qual é o animal que anda com uma pata?', resposta: 'pato', tipo: 'narrativo' }
  ],
  visual: [
    {
      enunciado: 'Quantos triângulos você vê na imagem?',
      resposta: '4',
      midia: 'https://res.cloudinary.com/dhcjegidn/image/upload/triangulos.png',
      tipo: 'image'
    },
    {
      enunciado: 'Qual o número escondido na imagem?',
      resposta: '7',
      midia: 'https://res.cloudinary.com/dhcjegidn/image/upload/numero_escondido.jpg',
      tipo: 'image'
    }
  ]
};

export function selecionarDesafioPorCategoriaEEstilo(categoria, estilo, numero) {
  const lista = desafios[categoria];
  if (!lista) return null;
  let filtrados = lista.filter(d => d.tipo === estilo);
  filtrados = filtrarResolvidos(filtrados, numero);
  if (filtrados.length === 0) {
    filtrados = filtrarResolvidos(lista, numero);
  }
  return filtrados[Math.floor(Math.random() * filtrados.length)];
}

export function escolherDesafioPorCategoria(categoria, numero, estilo = null) {
  const lista = desafios[categoria];
  if (!lista) return null;
   let filtrados = estilo ? lista.filter(d => d.tipo === estilo) : lista;
  filtrados = filtrarResolvidos(filtrados, numero);
  if (filtrados.length === 0 && estilo) {
    filtrados = filtrarResolvidos(lista, numero);
  }
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
    salvarMemoria();
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
