export const desafios = {
  matematica: [
    { enunciado: 'Quanto é 7 x 6?', resposta: '42', tipo: 'narrativo' },
    { enunciado: 'Qual é o dobro de 5?', resposta: '10', tipo: 'visual' },
    { enunciado: 'Se você tem 12 balas e come 5, quantas sobram?', resposta: '7', tipo: 'auditivo' },
    { enunciado: 'Quanto é 9 + 8?', resposta: '17', tipo: 'narrativo' },
    { enunciado: 'Quanto é 10 - 4?', resposta: '6', tipo: 'visual' },
    { enunciado: 'Se um lanche custa 5 reais, quanto custam 3 lanches?', resposta: '15', tipo: 'cinestesico' },
    { enunciado: 'Quanto é 6 x 7?', resposta: '42', tipo: 'narrativo' },
    { enunciado: 'Quanto é a metade de 20?', resposta: '10', tipo: 'visual' },
    { enunciado: 'Quantos lados tem um quadrado?', resposta: '4', tipo: 'auditivo' },
    { enunciado: 'Se tenho 4 maçãs e ganho mais 3, com quantas fico?', resposta: '7', tipo: 'cinestesico' }
  ],
  logica: [
    { enunciado: 'O que sobe e nunca desce?', resposta: 'idade', tipo: 'auditivo' },
    { enunciado: 'O que está sempre na sua frente, mas você nunca vê?', resposta: 'futuro', tipo: 'narrativo' },
    { enunciado: 'Tenho teclas mas não sou piano. O que sou?', resposta: 'teclado', tipo: 'visual' },
    { enunciado: 'Qual é a próxima letra da sequência: D, R, C, Q, __?', resposta: 'S', tipo: 'narrativo' },
    { enunciado: 'Sou seu e todo mundo usa. O que sou?', resposta: 'nome', tipo: 'auditivo' }
  ],
  portugues: [
    { enunciado: 'Qual é o plural de "cão"?', resposta: 'cães', tipo: 'visual' },
    { enunciado: 'Qual é o contrário de "grande"?', resposta: 'pequeno', tipo: 'auditivo' },
    { enunciado: 'Como se escreve a palavra "arroz" com Z ou S?', resposta: 'z', tipo: 'narrativo' },
    { enunciado: 'Qual é o aumentativo de "casa"?', resposta: 'casarão', tipo: 'visual' },
    { enunciado: 'Qual palavra está errada na frase: "As menina foi na escola"?', resposta: 'menina', tipo: 'auditivo' }
  ],
  charada: [
    { enunciado: '🍎🍎🍌 = 14. Qual é o valor de cada fruta?', resposta: 'maçã=5, banana=4', tipo: 'visual' },
    { enunciado: 'Sou alto quando jovem e baixo quando velho. O que sou?', resposta: 'vela', tipo: 'cinestesico' },
    { enunciado: 'Tenho dentes mas não mordo. O que sou?', resposta: 'pente', tipo: 'auditivo' },
    { enunciado: 'O que tem cabeça, tem dente, mas não é bicho nem gente?', resposta: 'alho', tipo: 'visual' },
    { enunciado: 'Quanto mais seco, mais molhado fica. O que é?', resposta: 'toalha', tipo: 'narrativo' }
  ],
  visual: [
    {
      enunciado: 'Qual é a soma dos números na imagem?',
      resposta: '10',
      midia: 'https://res.cloudinary.com/dhcjegidn/image/upload/v1717423596/soma-emojis.png',
      tipo: 'image'
    }
  ]
};

export function escolherDesafioPorCategoria(categoria, tipo) {
  const lista = desafios[categoria];
  if (!lista) return null;
  const filtrados = lista.filter(d => !tipo || d.tipo === tipo);
  return filtrados[Math.floor(Math.random() * filtrados.length)];
}
