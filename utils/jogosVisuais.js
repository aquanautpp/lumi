import { enviarMidiaWhatsApp, enviarMensagemWhatsApp } from './whatsapp.js';
import { desafiosPendentes, salvarMemoria } from './memoria.js';

const jogos = [
  {
    pergunta: "🔍 Quantos triângulos você vê na imagem?",
    midia: "https://res.cloudinary.com/dhcjegidn/image/upload/triangulos.png",
    resposta: "4",
    tipoMidia: "image"
  },
  {
    pergunta: "🎨 Qual o número escondido na imagem?",
    midia: "https://res.cloudinary.com/dhcjegidn/image/upload/numero_escondido.jpg",
    resposta: "7",
    tipoMidia: "image"
  },
  {
    pergunta: "🎥 Quantos pássaros aparecem no vídeo?",
    midia: "https://res.cloudinary.com/dhcjegidn/video/upload/passaros.mp4",
    resposta: "3",
    tipoMidia: "video"
  }
];

export async function enviarJogoVisual(numero) {
  const jogo = jogos[Math.floor(Math.random() * jogos.length)];
  await enviarMidiaWhatsApp(numero, jogo.midia, jogo.tipoMidia);
  await enviarMensagemWhatsApp(numero, jogo.pergunta);
  desafiosPendentes[numero] = { ...jogo, categoria: 'visual' };
  salvarMemoria();
}
