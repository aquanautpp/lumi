import { enviarMensagemWhatsApp } from './whatsapp.js';

const desafiosFamilia = [
  "🔤 Todos têm que dizer uma palavra que comece com a letra ‘A’. Quem repetir ou travar, sai da rodada!",
  "👀 Façam uma disputa de quem fica mais tempo sem piscar. Quem piscar primeiro vira o mestre do desafio da próxima vez!",
  "🎨 Em 3 minutos, cada um desenha o que mais gosta de fazer em família. Depois, compartilhem os desenhos e votem no mais criativo!",
  "🎶 Inventem juntos uma música de 4 versos com rima, falando sobre o dia de hoje. Vale ritmo, batida e muita criatividade!",
  "📦 Façam um jogo do ‘que tem na caixa?’: alguém esconde um objeto numa caixa e os outros fazem perguntas de sim ou não para adivinhar.",
  "🧩 Escolham um objeto comum (como uma colher) e cada um precisa inventar um uso maluco para ele. Quem for mais criativo vence!",
  "📚 Criem uma história juntos: cada pessoa fala uma frase e a próxima continua. No fim, deem um nome bem engraçado para a história!",
  "🕺 Dancem juntos por 1 minuto com uma música animada! Quem parar antes do tempo... vira estátua por 10 segundos!",
  "🧠 Cada um faz uma pergunta de lógica ou adivinhação (pode usar o celular!). Se todos acertarem uma, ganham um super selo de família genial!"
];

export async function enviarDesafioFamilia(numero) {
  const desafio = desafiosFamilia[Math.floor(Math.random() * desafiosFamilia.length)];
  await enviarMensagemWhatsApp(numero, `👨‍👩‍👧‍👦 Desafio em família: ${desafio}`);
}
