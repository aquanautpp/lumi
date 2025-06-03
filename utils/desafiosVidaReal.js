import { enviarMensagemWhatsApp } from './whatsapp.js';

const desafiosVidaReal = [
  "Encontre três objetos em sua casa que têm formato de círculo!",
  "Faça uma lista de cinco coisas que você vê que são vermelhas.",
  "Conte quantas janelas há em sua casa."
];

export async function enviarDesafioVidaReal(numero) {
  const desafio = desafiosVidaReal[Math.floor(Math.random() * desafiosVidaReal.length)];
  await enviarMensagemWhatsApp(numero, `🌟 Desafio da vida real: ${desafio}`);
}
