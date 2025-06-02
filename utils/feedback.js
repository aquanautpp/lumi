function gerarFeedback(acertou, categoria) {
  const mensagensAcertou = [
    `🎉 Mandou bem! Você é fera em ${categoria}!`,
    '🌟 Incrível! Você acertou mais uma!',
    `🚀 Você está voando nos desafios de ${categoria}!`
  ];

  const mensagensErrou = [
    '😊 Quase lá! Vamos tentar de novo?',
    '💡 Não desanime! Você está aprendendo!',
    `🤔 Hmm, não foi dessa vez. Que tal revisar ${categoria}?`
  ];

  const mensagens = acertou ? mensagensAcertou : mensagensErrou;
  return mensagens[Math.floor(Math.random() * mensagens.length)];
}

export { gerarFeedback };
feedback.js
