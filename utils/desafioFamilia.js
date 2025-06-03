import { enviarMensagemWhatsApp } from './whatsapp.js';

const desafiosFamilia = [
  "Cada um deve pensar em um número. Quem chegar mais perto de 20 vence!",
  "Todos devem dizer uma palavra que comece com a letra 'A'.",
  "Façam uma competição de quem fica mais tempo sem piscar."
];

export async function enviarDesafioFamilia(numero) {
  const desafio = desafiosFamilia[Math.floor(Math.random() * desafiosFamilia.length)];
  await enviarMensagemWhatsApp(numero, `👨‍👩‍👧‍👦 Desafio em família: ${desafio}`);
}
