// utils/desafios.js – versão consolidada, com lógica simplificada para crianças e melhorias visuais

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
    { enunciado: 'Qual é o aumentativo de "casa"?', resposta: 'casarão', tipo: 'visual' }
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

export function selecionarDesafioPorCategoriaEEstilo(categoria, estilo) {
  const lista = desafios[categoria];
  if (!lista) return null;
  const filtrados = lista.filter(d => d.tipo === estilo);
  return filtrados.length > 0
    ? filtrados[Math.floor(Math.random() * filtrados.length)]
    : lista[Math.floor(Math.random() * lista.length)];
}

export function escolherDesafioPorCategoria(categoria) {
  const lista = desafios[categoria];
  if (!lista) return null;
  return lista[Math.floor(Math.random() * lista.length)];
}

export function gerarMissao(estilo = null) {
  const categorias = ['matematica', 'logica', 'portugues'];
  const usadas = new Set();
  const missao = [];

  while (missao.length < 3 && categorias.length > 0) {
    const cat = categorias[Math.floor(Math.random() * categorias.length)];
    if (!usadas.has(cat)) {
      const desafio = estilo
        ? selecionarDesafioPorCategoriaEEstilo(cat, estilo)
        : escolherDesafioPorCategoria(cat);
      if (desafio) {
        missao.push({ ...desafio, categoria: cat });
        usadas.add(cat);
      }
      categorias.splice(categorias.indexOf(cat), 1);
    }
  }

  return missao.length === 3 ? missao : null;
}
