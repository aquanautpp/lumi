export const desafios = {
  matematica: [
    { enunciado: 'Quanto é 7 x 6?', resposta: '42', tipo: 'narrativo' },
    { enunciado: 'Qual é o dobro de 5?', resposta: '10', tipo: 'visual' },
    { enunciado: 'Se você tem 12 balas e come 5, quantas sobram?', resposta: '7', tipo: 'auditivo' },
    // ... adicione os 20 já enviados por mim e pelo Grok
  ],
  logica: [
    { enunciado: 'O que sobe e nunca desce?', resposta: 'idade', tipo: 'auditivo' },
    { enunciado: 'O que está sempre na sua frente, mas você nunca vê?', resposta: 'futuro', tipo: 'narrativo' },
    // ...
  ],
  portugues: [
    { enunciado: 'Qual é o plural de "cão"?', resposta: 'cães', tipo: 'visual' },
    { enunciado: 'Qual é o contrário de "grande"?', resposta: 'pequeno', tipo: 'auditivo' },
    // ...
  ],
  charada: [
    { enunciado: '🍎🍎🍌 = 14. Qual é o valor de cada fruta?', resposta: 'maçã=5, banana=4', tipo: 'visual' },
    { enunciado: 'Sou alto quando jovem e baixo quando velho. O que sou?', resposta: 'vela', tipo: 'cinestesico' },
    // ...
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
