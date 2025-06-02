// utils/estiloAprendizagem.js

import { memoriaUsuarios, salvarMemoria } from './memoria.js';
import { enviarMensagemWhatsApp } from './whatsapp.js';

const perguntasEstilo = [
  { id: 1, estilo: "visual", texto: "📸 Você prefere aprender vendo imagens ou vídeos?" },
  { id: 2, estilo: "auditivo", texto: "🎧 Você aprende melhor ouvindo explicações ou músicas?" },
  { id: 3, estilo: "cinestesico", texto: "👐 Gosta de aprender fazendo coisas com as mãos ou se movendo?" },
  { id: 4, estilo: "narrativo", texto: "📖 Você adora quando te explicam algo com uma história?" },
  { id: 5, estilo: "visual", texto: "👀 Você prefere ver um desenho do que ouvir uma explicação?" },
  { id: 6, estilo: "auditivo", texto: "🎤 Você lembra melhor quando alguém te conta em voz alta?" }
];

export async function aplicarPerguntaEstilo(numero) {
  const usuario = memoriaUsuarios[numero];

  if (!usuario) return;

  usuario.estilo = usuario.estilo || { respostas: {}, concluido: false };

  const totalRespostas = Object.keys(usuario.estilo.respostas).length;

  if (usuario.estilo.concluido || totalRespostas >= perguntasEstilo.length) {
    return;
  }

  const proxima = perguntasEstilo.find(p => !(p.id in usuario.estilo.respostas));
  if (proxima) {
    await enviarMensagemWhatsApp(numero, `👩‍🏫 Perguntinha rápida!\n${proxima.texto}\n\nResponda com SIM ou NÃO 😉`);
    usuario.estilo.perguntaAtual = proxima.id;
    salvarMemoria();
  }
}

export async function processarRespostaEstilo(numero, texto) {
  const usuario = memoriaUsuarios[numero];
  if (!usuario || !usuario.estilo || usuario.estilo.concluido) return false;

  const id = usuario.estilo.perguntaAtual;
  const resposta = texto.trim().toLowerCase();

  if (!id || !["sim", "não", "nao"].includes(resposta)) return false;

  const pergunta = perguntasEstilo.find(p => p.id === id);
  if (!pergunta) return false;

  if (resposta === "sim") {
    usuario.estilo.respostas[pergunta.estilo] = (usuario.estilo.respostas[pergunta.estilo] || 0) + 1;
  }

  delete usuario.estilo.perguntaAtual;

  const totalRespondidas = Object.keys(usuario.estilo.respostas).reduce((acc, estilo) => acc + usuario.estilo.respostas[estilo], 0);

  if (totalRespondidas >= 3 && Object.keys(usuario.estilo.respostas).length >= 2) {
    const estiloDominante = Object.entries(usuario.estilo.respostas).sort((a, b) => b[1] - a[1])[0][0];
    usuario.estilo.concluido = true;
    usuario.estilo.tipo = estiloDominante;

    const mensagens = {
      visual: "🌈 Você tem um jeitinho *visual* de aprender! Vou usar mais desenhos e desafios com imagens pra te ajudar!",
      auditivo: "🎵 Você é um aprendiz *auditivo*! Vou usar áudios e rimas pra facilitar seu aprendizado!",
      cinestesico: "🤸‍♀️ Você aprende com o corpo! Desafios com movimento e prática vão te ajudar muito!",
      narrativo: "📚 Você é apaixonado por histórias! Vou contar aventuras enquanto ensinamos juntos!"
    };

    await enviarMensagemWhatsApp(numero, `✨ Descobri algo sobre você!\n${mensagens[estiloDominante]}`);
  } else {
    await aplicarPerguntaEstilo(numero);
  }

  salvarMemoria();
  return true;
}
