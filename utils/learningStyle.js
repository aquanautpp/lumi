import { memoriaUsuarios, salvarMemoria } from './memoria.js';
import { enviarMensagemWhatsApp } from './whatsapp.js';

const perguntas = [
  { id: 1, estilo: 'visual', texto: '👀 Prefere ver um desenho mostrando como fazer algo?' },
  { id: 2, estilo: 'auditivo', texto: '🎧 Gosta de ouvir alguém explicando enquanto pratica?' },
  { id: 3, estilo: 'cinestesico', texto: '🤸 Aprende melhor quando pode se mexer fazendo a atividade?' },
  { id: 4, estilo: 'narrativo', texto: '📖 Entende melhor quando escuta uma historinha sobre o assunto?' }
];

export async function aplicarPerguntaEstilo(numero) {
  const usuario = memoriaUsuarios[numero];
  if (!usuario) return;
  usuario.quiz = usuario.quiz || { respostas: {}, concluido: false };
  const respondidas = Object.keys(usuario.quiz.respostas).length;
  if (usuario.quiz.concluido || respondidas >= perguntas.length) return;
  const proxima = perguntas.find(p => !(p.id in usuario.quiz.respostas));
  if (proxima) {
    usuario.quiz.perguntaAtual = proxima.id;
    await salvarMemoria();
    await enviarMensagemWhatsApp(
      numero,
      `${proxima.texto}\nResponda de 1 (discordo) a 5 (concordo)`
    );
  }
}

export async function processarRespostaEstilo(numero, texto) {
  const usuario = memoriaUsuarios[numero];
  if (!usuario?.quiz || usuario.quiz.concluido) return false;
  const id = usuario.quiz.perguntaAtual;
  if (!id) return false;
  const m = texto.trim().match(/^([1-5])$/);
  if (!m) return false;
  usuario.quiz.respostas[id] = parseInt(m[1], 10);
  delete usuario.quiz.perguntaAtual;

  if (Object.keys(usuario.quiz.respostas).length >= perguntas.length) {
    const pontuacoes = {};
    for (const [pid, val] of Object.entries(usuario.quiz.respostas)) {
      const p = perguntas.find(q => q.id === parseInt(pid));
      pontuacoes[p.estilo] = (pontuacoes[p.estilo] || 0) + val;
    }
    const estiloDominante = Object.entries(pontuacoes).sort((a,b) => b[1]-a[1])[0][0];
    usuario.learningStyle = estiloDominante;
    usuario.quiz.concluido = true;
    await enviarMensagemWhatsApp(numero, `Parece que você aprende melhor fazendo atividades em movimento!`);
  } else {
    await aplicarPerguntaEstilo(numero);
  }
  await salvarMemoria();
  return true;
}
