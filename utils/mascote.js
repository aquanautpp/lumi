// utils/mascote.js

export const mascote = {
  nome: "Luzinho",  // Nome sugerido, pode ser alterado pela criança
  humor: "feliz",   // Emoção inicial: "feliz", "pensativo", "animado", "triste"
  falas: {
    acerto: [
      "Você arrasou, campeão! 💪",
      "Boa! Acertei que você ia acertar! 😄",
      "Você é rápido como um foguete! 🚀"
    ],
    erro: [
      "Opa! Vamos tentar de novo juntos? 🤔",
      "Não tem problema errar! Bora? 🚀",
      "Quase lá! Você vai brilhar na próxima! 🌟"
    ],
    nivel: [
      "Uhuu! Novo nível desbloqueado! ⭐",
      "Você está subindo como um foguete! 🚀",
      "Que incrível! Você é uma estrela! 🌌"
    ],
    ausencia: [
      "Senti sua falta! Vamos brincar com números? 💛",
      "Ei, cadê você? Vamos aprender juntos! 📚",
      "Volte logo, tá? Você é meu parceiro de aventura! 😊"
    ]
  }
};

export function getFala(tipo) {
  const falasTipo = mascote.falas[tipo];
  if (!falasTipo || falasTipo.length === 0) {
    return "Ops, não sei o que dizer agora! 😅";
  }
  const indiceAleatorio = Math.floor(Math.random() * falasTipo.length);
  return falasTipo[indiceAleatorio];
}
