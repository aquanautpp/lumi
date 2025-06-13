import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import { enviarMensagemWhatsApp, enviarMidiaWhatsApp } from '../utils/whatsapp.js';
import { escolherDesafioPorCategoria, gerarMissao, enviarCharadaVisual, registrarDesafioResolvido, selecionarDesafioPorCategoriaEEstilo } from '../utils/desafios.js';
import {
  memoriaUsuarios,
  desafiosPendentes,
  missoesPendentes,
  salvarMemoria,
  definirNome,
  definirMascote
} from '../utils/memoria.js';
import { gerarFeedback } from '../utils/feedback.js';
import { atualizarMemoria } from '../utils/historico.js';
import { verificarNivel, obterNivel } from '../utils/niveis.js';
import { validarResposta, validarTentativas } from '../utils/validacao.js';
import { exportarParaGoogleSheets } from '../utils/analytics.js';
import { obterDesafioDoDia } from '../utils/rotinaSemanal.js';
import { getFala } from '../utils/mascote.js';
import { aplicarPerguntaEstilo, processarRespostaEstilo } from '../utils/learningStyle.js';
import nlp from 'compromise';
import { gerarRespostaIA } from '../utils/ia.js';
import { enviarDesafioFamilia } from '../utils/desafioFamilia.js';
import { enviarDesafioVidaReal } from '../utils/desafiosVidaReal.js';
import { iniciarAventura, enviarDesafioAventura } from '../utils/aventura.js';
import { explainCurrent } from '../utils/challenges.js';

import webhookRouter from './routes/webhook.js';

dotenv.config();

function validateEnv() {
  if (process.env.NODE_ENV === 'test') return;

  const usingTwilio = process.env.TWILIO_ACCOUNT_SID;
  const missing = [];

  if (usingTwilio) {
    ['TWILIO_AUTH_TOKEN', 'TWILIO_WHATSAPP_NUMBER'].forEach(v => {
      if (!process.env[v]) missing.push(v);
    });
  } else {
    ['WHATSAPP_TOKEN', 'VERIFY_TOKEN'].forEach(v => {
      if (!process.env[v]) missing.push(v);
    });
    if (!process.env.PHONE_ID && !process.env.FROM_PHONE_ID) missing.push('PHONE_ID');
  }

  if (!process.env.OPENAI_API_KEY) missing.push('OPENAI_API_KEY');

  if (missing.length) {
    console.error('Missing environment variables: ' + missing.join(', '));
    process.exit(1);
  }
}

validateEnv();

const LIMITE_INTERACOES = parseInt(process.env.LIMITE_INTERACOES || '20', 10);

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/webhook', (req, res) => {
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (token === process.env.VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

const comandosRapidos = [
  { title: "📚 Missão do Dia", body: "Quero a missão do dia" },
  { title: "🧠 Me dá um desafio", body: "Quero um desafio" },
  { title: "❓Quem é você?", body: "Quem é você?" }
];

const OPCOES_FINAIS = [
  { title: "✅ Sim!", body: "Sim!" },
  { title: "❌ Não por enquanto", body: "Não por enquanto" }
];

function extrairTexto(message) {
  if (message.text?.body) return message.text.body.trim();
  const inter = message.interactive;
  if (inter?.button_reply) return inter.button_reply.id || inter.button_reply.title;
  if (inter?.list_reply) return inter.list_reply.id || inter.list_reply.title;
  return '';
}

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function enviarMensagemFinalDeTeste(numero) {
  const mensagem =
    "🌟 Você chegou ao fim do modo de teste! Aqui vão algumas dicas para aprender melhor:\n" +
    "1️⃣ Faça perguntas sempre que ficar curioso.\n" +
    "2️⃣ Explique o que aprendeu para alguém.\n" +
    "3️⃣ Crie desenhos ou mapas para suas ideias.\n" +
    "Que tal ler o livro 'Como um Cientista Aprende'?\n\n" +
    "Você gostaria de brincar com a versão oficial da Lumi?";
  return enviarMensagemWhatsApp(numero, mensagem, OPCOES_FINAIS);
}

const comandosDetalhados = [
"📚 'Quero a missão do dia' - Receber três desafios especiais",
  "🧠 'Quero um desafio' - Desafio do dia",
  "❓ 'Quem é você?' - Saber sobre a Lumi",
  "📈 'Qual meu nível?' - Ver seu progresso",
  "🎯 'Meu estilo' - Teste de personalidade",
  "👨‍👩‍👧 'Desafio em família' - Atividade em grupo",
  "🏠 'Desafio da vida real' - Tarefas para fazer em casa",
  "🌋 'Aventura' - Desafio temático",
  "❓ 'Charada' - Enviar uma charada divertida",
  "🛑 'Parar' - Cancelar missões ou desafios"
];

function enviarListaComandos(numero) {
  const textoComandos = comandosDetalhados.join("\n");
  return enviarMensagemWhatsApp(
    numero,
    `Aqui estão alguns comandos que posso entender:\n${textoComandos}`
  );
}

function enviarBoasVindas(numero) {
  return enviarMensagemWhatsApp(
    numero,
    "Oi, eu sou a Lumi 💛. Peça o 'menu' para ver meus comandos e escreva 'Meu estilo' se quiser descobrir seu jeito de aprender!",
    comandosRapidos
  );
}

app.get('/admin', (req, res) => {
  const usuarios = Object.entries(memoriaUsuarios).map(([numero, dados]) => ({
    numero,
    nome: dados.nome || null,
    nivel: dados.nivelAtual || 1,
    missoesPendentes: missoesPendentes[numero]?.desafios?.length || 0,
    desafiosPendentes: desafiosPendentes[numero] ? 1 : 0,
    historico: (dados.historico || []).length
  }));
  res.json({ usuarios });
});

app.get('/admin/export', async (req, res) => {
  try {
    await exportarParaGoogleSheets();
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Falha ao exportar' });
  }
});

app.use(webhookRouter({
  extrairTexto,
  normalizarTexto,
  enviarMensagemFinalDeTeste,
  comandosRapidos,
  OPCOES_FINAIS,
  comandosDetalhados,
  enviarListaComandos,
  enviarBoasVindas,
  LIMITE_INTERACOES
}));

app.get('/health', (req, res) => {
  res.send('OK');
});

export default app;
