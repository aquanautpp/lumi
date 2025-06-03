// index.js
import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { enviarMensagemWhatsApp, enviarMidiaWhatsApp } from './utils/whatsapp.js';
import { desafios, selecionarDesafioPorCategoriaEEstilo, escolherDesafioPorCategoria, gerarMissao } from './utils/desafios.js';
import { memoriaUsuarios, desafiosPendentes, missoesPendentes, salvarMemoria, alternarModoSussurro } from './utils/memoria.js';
import { generatePdfReport } from './utils/pdfReport.js';
import { uploadPdfToCloudinary } from './utils/cloudinary.js';
import { gerarFeedback } from './utils/feedback.js';
import { atualizarMemoria } from './utils/historico.js';
import { verificarNivel } from './utils/niveis.js';
import { validarResposta } from './utils/validacao.js';
import { obterDesafioDoDia } from './utils/rotinaSemanal.js';
import { getFala } from './utils/mascote.js';
import { aplicarPerguntaEstilo, processarRespostaEstilo } from './utils/estiloAprendizagem.js';
import { gerarRespostaIA } from './utils/ia.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const comandosRapidos = [
  { title: "📚 Missão do Dia", body: "Quero a missão do dia" },
  { title: "🧠 Me dá um desafio", body: "Quero um desafio" },
  { title: "❓Quem é você?", body: "Quem é você?" }
];

function enviarMenuInicial(numero) {
  return enviarMensagemWhatsApp(numero, 'Oi! Eu sou a Professora Lumi 💛 Sua tutora divertida para aprender brincando! O que você quer fazer hoje?', comandosRapidos);
}

app.post('/webhook', async (req, res) => {
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message) return res.sendStatus(200);

  const from = message.from;
  const texto = message.text?.body?.trim() || '';
  const textoLower = texto.toLowerCase();

  // Mensagem automática de boas-vindas caso seja a primeira mensagem após escaneio do QR Code
  if (!memoriaUsuarios[from] && ["oi", "olá", "lumi", "começar", "iniciar"].some(p => textoLower.includes(p))) {
    memoriaUsuarios[from] = { interacoes: 0, historico: [] };
    await enviarMensagemWhatsApp(from, 'Oi! Eu sou a Professora Lumi 💛 Criada pelo Victor Pires para te ajudar a aprender de forma divertida! 😊 Quer um desafio, uma missão ou tirar dúvidas?', comandosRapidos);
    salvarMemoria();
    return res.sendStatus(200);
  }

  if (!memoriaUsuarios[from]) {
    memoriaUsuarios[from] = { interacoes: 0, historico: [] };
    await enviarMenuInicial(from);
    salvarMemoria();
    return res.sendStatus(200);
  }

  const respondeuEstilo = await processarRespostaEstilo(from, texto);
  if (respondeuEstilo) return res.sendStatus(200);

  const usuario = memoriaUsuarios[from];
  usuario.interacoes += 1;
  memoriaUsuarios[from] = usuario;
  salvarMemoria();

  if (["parar", "cancelar", "sair"].includes(textoLower)) {
    delete missoesPendentes[from];
    delete desafiosPendentes[from];
    await enviarMensagemWhatsApp(from, 'Tudo bem, a gente pode continuar depois! 💛');
    return res.sendStatus(200);
  }

  if (textoLower.includes("qual era a resposta")) {
    const historico = usuario.historico || [];
    const ultimo = historico[historico.length - 1];
    if (ultimo?.respostaCorreta) {
      await enviarMensagemWhatsApp(from, `A resposta correta era: ${ultimo.respostaCorreta}`);
    } else {
      await enviarMensagemWhatsApp(from, 'Não encontrei a última resposta correta 🤔');
    }
    return res.sendStatus(200);
  }

  if (textoLower.includes('missao') || textoLower.includes('missão')) {
    if (!missoesPendentes[from]) {
      const estilo = usuario.estilo?.tipo || null;
      const missao = gerarMissao(estilo);
      if (missao) {
        missoesPendentes[from] = { desafios: missao, atual: 0 };
        salvarMemoria();
        const primeiro = missao[0];
        await enviarMensagemWhatsApp(from, `📘 Missão do Dia! Categoria: ${primeiro.categoria}

🧠 ${primeiro.enunciado}`);
        if (primeiro.midia) await enviarMidiaWhatsApp(from, primeiro.midia, primeiro.tipo);
      } else {
        await enviarMensagemWhatsApp(from, 'Não consegui criar a missão agora. Tente mais tarde!');
      }
    } else {
      await enviarMensagemWhatsApp(from, 'Você já tem uma missão em andamento! Responda o desafio anterior.');
    }
    return res.sendStatus(200);
  }

  if (["quero um desafio", "me dá um desafio", "desafio"].some(t => textoLower.includes(t))) {
    const estilo = usuario.estilo?.tipo || null;
    const hoje = obterDesafioDoDia();
    const desafio = estilo ? selecionarDesafioPorCategoriaEEstilo(hoje.categoria, estilo) : escolherDesafioPorCategoria(hoje.categoria);
    desafiosPendentes[from] = desafio;
    salvarMemoria();
    if (!desafio) {
      await enviarMensagemWhatsApp(from, `📅 Hoje é dia de *${hoje.categoria}*, mas não encontrei um desafio agora. Me peça um desafio com outra categoria!`);
      return res.sendStatus(200);
    }
    await enviarMensagemWhatsApp(from, `📅 Hoje é dia de *${hoje.categoria}*!

🧠 ${desafio.enunciado}`);
    if (desafio.midia) await enviarMidiaWhatsApp(from, desafio.midia, desafio.tipo);
    return res.sendStatus(200);
  }

  if (["charada", "imagem"].some(p => textoLower.includes(p))) {
    const desafio = desafios.find(d => d.tipo === 'image');
    if (desafio) {
      desafiosPendentes[from] = desafio;
      salvarMemoria();
      await enviarMensagemWhatsApp(from, `🔍 Charada visual:

${desafio.enunciado}`);
      if (desafio.midia) await enviarMidiaWhatsApp(from, desafio.midia, desafio.tipo);
    } else {
      await enviarMensagemWhatsApp(from, 'Ainda não tenho uma charada visual no momento! 😕');
    }
    return res.sendStatus(200);
  }

  if (["oi", "olá", "quem é você", "quem criou você", "o que você faz", "lumi"].some(p => textoLower.includes(p))) {
    await enviarMensagemWhatsApp(from, 'Sou a Professora Lumi 💛, criada pelo Victor Pires para tornar o aprendizado divertido! 💡 Posso te dar um desafio, uma missão ou responder dúvidas. É só me pedir! 😊');
    return res.sendStatus(200);
  }

  const resposta = await gerarRespostaIA(texto);
  await enviarMensagemWhatsApp(from, resposta);
  res.sendStatus(200);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Lumi está rodando na porta ${PORT}`);
});
