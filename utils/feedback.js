const feedbacksPorEstilo = {
  visual: {
    acerto: [
      "🎉 Você é um artista! Acertou mais uma!",
      "🌟 Seu olhar é incrível! Parabéns!",
      "🚀 Você está desenhando seu caminho para o sucesso!"
    ],
    erro: [
      "😊 Vamos tentar ver de outro ângulo?",
      "💡 Não desanime! Vamos pintar uma nova tentativa!",
      "🤔 Hmm, que tal desenhar a solução?"
    ]
  },
  auditivo: {
    acerto: [
      "🎉 Você tem um ouvido afiado! Acertou!",
      "🌟 Sua melodia é perfeita! Parabéns!",
      "🚀 Você está compondo sua sinfonia de sucessos!"
    ],
    erro: [
      "😊 Vamos afinar essa resposta?",
      "💡 Não desanime! Vamos ouvir a solução novamente!",
      "🤔 Hmm, que tal repetir em voz alta?"
    ]
  },
  cinestesico: {
    acerto: [
      "🎉 Você é um atleta do conhecimento! Acertou!",
      "🌟 Seu movimento é incrível! Parabéns!",
      "🚀 Você está dançando no caminho certo!"
    ],
    erro: [
      "😊 Vamos ajustar o passo?",
      "💡 Não desanime! Vamos sentir a solução!",
      "🤔 Hmm, que tal construir a resposta com as mãos?"
    ]
  },
  narrativo: {
    acerto: [
      "🎉 Você é um contador de histórias incrível! Acertou!",
      "🌟 Sua narrativa é perfeita! Parabéns!",
      "🚀 Você está escrevendo sua própria saga de sucessos!"
    ],
    erro: [
      "😊 Vamos reescrever esse capítulo?",
      "💡 Não desanime! Vamos imaginar uma nova história!",
      "🤔 Hmm, que tal criar um diálogo para a solução?"
    ]
  }
};

const feedbacksGenericos = {
  acerto: [
    "🎉 Mandou bem! Você é fera!",
    "🌟 Incrível! Você acertou mais uma!",
    "🚀 Você está voando nos desafios!"
  ],
  erro: [
    "😊 Quase lá! Vamos tentar de novo?",
    "💡 Não desanime! Você está aprendendo!",
    "🤔 Hmm, não foi dessa vez. Que tal revisar?"
  ]
};

export function gerarFeedback(acertou, estilo) {
  const tipo = acertou ? 'acerto' : 'erro';
  let mensagens = feedbacksGenericos[tipo];
  if (estilo && feedbacksPorEstilo[estilo]) {
    mensagens = feedbacksPorEstilo[estilo][tipo];
  }
  return mensagens[Math.floor(Math.random() * mensagens.length)];
}
