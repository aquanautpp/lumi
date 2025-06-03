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
  return enviarMensagemWhatsApp(numero, 'Oi! Eu sou a Professora Lumi 💜 Sua tutora divertida para aprender brincando! O que você quer fazer hoje?', comandosRapidos);
}

app.post('/webhook', async (req, res) => {
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message) return res.sendStatus(200);

  const from = message.from;
  const texto = message.text?.body?.trim() || '';
  const textoLower = texto.toLowerCase();

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

  // Cancelar missão ou desafio
  if (["parar", "cancelar", "sair"].includes(textoLower)) {
    delete missoesPendentes[from];
    delete desafiosPendentes[from];
    await enviarMensagemWhatsApp(from, 'Tudo bem, a gente pode continuar depois! 💜');
    return res.sendStatus(200);
  }

  // Mostrar resposta anterior
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

  // Missão do dia
  if (textoLower.includes('missao') || textoLower.includes('missão')) {
    if (!missoesPendentes[from]) {
      const estilo = usuario.estilo?.tipo || null;
      const missao = gerarMissao(estilo);
      if (missao) {
        missoesPendentes[from] = { desafios: missao, atual: 0 };
        salvarMemoria();
        const primeiro = missao[0];
        await enviarMensagemWhatsApp(from, `🎯 Missão do Dia! Categoria: ${primeiro.categoria}\n\n🧠 ${primeiro.enunciado}`);
        if (primeiro.midia) await enviarMidiaWhatsApp(from, primeiro.midia, primeiro.tipo);
      } else {
        await enviarMensagemWhatsApp(from, 'Não consegui criar a missão agora. Tente mais tarde!');
      }
    } else {
      await enviarMensagemWhatsApp(from, 'Você já tem uma missão em andamento! Responda o desafio anterior.');
    }
    return res.sendStatus(200);
  }

  // Continuar missão
  if (missoesPendentes[from]) {
    const missao = missoesPendentes[from];
    const desafio = missao.desafios[missao.atual];
    const acertou = validarResposta(texto, desafio.resposta, desafio.sinonimos || []);

    atualizarMemoria(from, desafio.categoria, acertou, texto, desafio.resposta);
    const estilo = usuario.estilo?.tipo || null;
    const feedback = gerarFeedback(acertou, estilo);
    await enviarMensagemWhatsApp(from, feedback);

    if (acertou) {
      missao.atual++;
      if (missao.atual >= missao.desafios.length) {
        await enviarMensagemWhatsApp(from, '🎉 Missão completa! Você é demais! 🥇✨');
        const msgNivel = verificarNivel(usuario);
        if (msgNivel) await enviarMensagemWhatsApp(from, msgNivel);
        delete missoesPendentes[from];
      } else {
        const prox = missao.desafios[missao.atual];
        await enviarMensagemWhatsApp(from, `🎉 Muito bem! Agora tente este:\n\n🧠 ${prox.enunciado}`);
        if (prox.midia) await enviarMidiaWhatsApp(from, prox.midia, prox.tipo);
      }
    } else {
      await enviarMensagemWhatsApp(from, 'Quase! Vamos tentar de novo? 🌀 A missão foi reiniciada.');
      delete missoesPendentes[from];
    }
    salvarMemoria();
    return res.sendStatus(200);
  }

  // Responder desafio pendente
  if (desafiosPendentes[from]) {
    const desafio = desafiosPendentes[from];
    const acertou = validarResposta(texto, desafio.resposta, desafio.sinonimos || []);
    atualizarMemoria(from, desafio.categoria, acertou, texto, desafio.resposta);
    const estilo = usuario.estilo?.tipo || null;
    const feedback = gerarFeedback(acertou, estilo);
    await enviarMensagemWhatsApp(from, feedback);
    const msgNivel = verificarNivel(usuario);
    if (msgNivel) await enviarMensagemWhatsApp(from, msgNivel);
    delete desafiosPendentes[from];
    salvarMemoria();
    return res.sendStatus(200);
  }

  // Pedir desafio
  if (["quero um desafio", "me dá um desafio", "desafio"].some(t => textoLower.includes(t))) {
    const estilo = usuario.estilo?.tipo || null;
    const hoje = obterDesafioDoDia();
    const desafio = estilo ? selecionarDesafioPorCategoriaEEstilo(hoje.categoria, estilo) : escolherDesafioPorCategoria(hoje.categoria);
    desafiosPendentes[from] = desafio;
    salvarMemoria();
    await enviarMensagemWhatsApp(from, `📅 Hoje é dia de *${hoje.categoria}*!\n\n🧠 ${desafio.enunciado}`);
    if (desafio.midia) await enviarMidiaWhatsApp(from, desafio.midia, desafio.tipo);
    return res.sendStatus(200);
  }

  // Pedir charada visual
  if (textoLower.includes("charada") || textoLower.includes("imagem")) {
    const desafio = desafios.find(d => d.tipo === 'image');
    if (desafio) {
      desafiosPendentes[from] = desafio;
      salvarMemoria();
      await enviarMensagemWhatsApp(from, `🔍 Charada visual:\n\n${desafio.enunciado}`);
      if (desafio.midia) await enviarMidiaWhatsApp(from, desafio.midia, desafio.tipo);
    } else {
      await enviarMensagemWhatsApp(from, 'Ainda não tenho uma charada visual no momento! 😕');
    }
    return res.sendStatus(200);
  }

  // Frases abertas
  if (["oi", "olá", "quem é você", "lumi"].some(p => textoLower.includes(p))) {
    await enviarMenuInicial(from);
    return res.sendStatus(200);
  }

  // Último recurso: IA
  const resposta = await gerarRespostaIA(texto);
  await enviarMensagemWhatsApp(from, resposta);
  res.sendStatus(200);
});

app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('🔐 Webhook verificado com sucesso!');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

cron.schedule('0 9 * * 0', async () => {
  for (const numero of Object.keys(memoriaUsuarios)) {
    const usuario = memoriaUsuarios[numero];
    const caminho = `tmp/relatorio-${numero}.pdf`;
    await generatePdfReport({ nome: usuario.nome || 'Aluno(a)', numero, progresso: usuario.historico, caminho });
    const url = await uploadPdfToCloudinary(caminho);
    await enviarMidiaWhatsApp(numero, url, 'document');
    await enviarMensagemWhatsApp(numero, getFala('ausencia'));
  }
});

cron.schedule('0 10 * * 0', () => {
  const desafio = '🌟 Desafio em família: cada um deve dizer um número. Quem disser o maior ganha!';
  for (const numero of Object.keys(memoriaUsuarios)) {
    enviarMensagemWhatsApp(numero, desafio);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Lumi está rodando na porta ${PORT}`);
});
