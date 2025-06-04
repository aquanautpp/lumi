// utils/estiloAprendizagem.js ATUALIZADO – corrige repetição e conclusões
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
  const respondidas = Object.keys(usuario.estilo.respostas).length;

  if (usuario.estilo.concluido || respondidas >= perguntasEstilo.length) return;

  const proxima = perguntasEstilo.find(p => !(p.id in usuario.estilo.respostas));
  if (proxima) {
    usuario.estilo.perguntaAtual = proxima.id;
    salvarMemoria();
  await enviarMensagemWhatsApp(
      numero,
      `👩‍🏫 Perguntinha rápida!\n${proxima.texto}\n\nResponda de 1 (discordo totalmente) a 5 (concordo totalmente)`
    );
  }
}

export async function processarRespostaEstilo(numero, texto) {
  const usuario = memoriaUsuarios[numero];
  if (!usuario?.estilo || usuario.estilo.concluido) return false;

  const id = usuario.estilo.perguntaAtual;
 if (!id) return false;

  const resp = texto.trim().toLowerCase();
  let valor = null;
  if (/^[1-5]$/.test(resp)) {
    valor = parseInt(resp, 10);
  } else if (resp === 'sim') {
    valor = 5;
  } else if (resp === 'não' || resp === 'nao') {
    valor = 1;
  } else {
    return false;
  }

  usuario.estilo.respostas[id] = valor;
  delete usuario.estilo.perguntaAtual;
  
   if (Object.keys(usuario.estilo.respostas).length >= perguntasEstilo.length) {
    const pontuacoes = {};
    for (const [pid, val] of Object.entries(usuario.estilo.respostas)) {
      const p = perguntasEstilo.find(q => q.id === parseInt(pid));
      pontuacoes[p.estilo] = (pontuacoes[p.estilo] || 0) + val;
    }
    const estiloDominante = Object.entries(pontuacoes).sort((a, b) => b[1] - a[1])[0][0];
    usuario.estilo.tipo = estiloDominante;
    usuario.estilo.concluido = true;

    const mensagens = {
      visual: "🌈 Você tem um jeitinho *visual* de aprender! Vou usar mais desenhos e desafios com imagens pra te ajudar!",
      auditivo: "🎵 Você é um aprendiz *auditivo*! Vou usar áudios e rimas pra facilitar seu aprendizado!",
      cinestesico: "🤸‍♀️ Você aprende com o corpo! Desafios com movimento e prática vão te ajudar muito!",
      narrativo: "📚 Você é apaixonado por histórias! Vou contar aventuras enquanto ensinamos juntos!"
    };

    await enviarMensagemWhatsApp(numero, `✨ Descobri algo sobre você!
${mensagens[estiloDominante]}`);
  } else {
    await aplicarPerguntaEstilo(numero);
  }

  salvarMemoria();
  return true;
}

export async function iniciarQuizAutomatico(numero) {
  const usuario = memoriaUsuarios[numero];
  if (!usuario) return false;

  usuario.estilo = usuario.estilo || { respostas: {}, concluido: false };

  const interacoes = usuario.interacoes || 0;
  if (
    interacoes >= 5 &&
    interacoes <= 8 &&
    !usuario.estilo.concluido &&
    !usuario.estilo.perguntaAtual &&
    Object.keys(usuario.estilo.respostas).length === 0
  ) {
    await aplicarPerguntaEstilo(numero);
    return true;
  }
  return false;
}
