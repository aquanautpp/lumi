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

function enviarBoasVindas(numero) {
  return enviarMensagemWhatsApp(numero, 'Oi, eu sou a Lumi 💛', comandosRapidos);
}

app.post('/webhook', async (req, res) => {
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message) return res.sendStatus(200);

  const from = message.from;
  const texto = message.text?.body?.trim() || '';
  const textoLower = texto.toLowerCase();

  // Caso ainda não exista memória, cria e envia mensagem inicial uma única vez
  if (!memoriaUsuarios[from]) {
    memoriaUsuarios[from] = { interacoes: 0, historico: [], mensagemBoasVindasEnviada: false };
    await enviarBoasVindas(from);
    memoriaUsuarios[from].mensagemBoasVindasEnviada = true;
    salvarMemoria();
    return res.sendStatus(200);
  }

  const usuario = memoriaUsuarios[from];
  usuario.historico = usuario.historico || [];

  // Garante que a mensagem de boas-vindas só seja enviada uma única vez
  if (!usuario.mensagemBoasVindasEnviada) {
    await enviarBoasVindas(from);
    usuario.mensagemBoasVindasEnviada = true;
    salvarMemoria();
    return res.sendStatus(200);
  }

  const respondeuEstilo = await processarRespostaEstilo(from, texto);
  if (respondeuEstilo) return res.sendStatus(200);

  usuario.interacoes = (usuario.interacoes || 0) + 1;
  salvarMemoria();

// Processa resposta do desafio pendente
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

  if (["quero um desafio", "me dá um desafio", "desafio"].some(t => textoLower === t)) {
    const estilo = usuario.estilo?.tipo || null;
    const hoje = obterDesafioDoDia();
    const desafio = estilo ? selecionarDesafioPorCategoriaEEstilo(hoje.categoria, estilo) : escolherDesafioPorCategoria(hoje.categoria);
    desafiosPendentes[from] = desafio ? { ...desafio, categoria: hoje.categoria } : null;
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
      let desafioEncontrado = null;
    let categoriaImagem = null;
    for (const cat of Object.keys(desafios)) {
      const possivel = desafios[cat].find(d => d.tipo === 'image');
      if (possivel) {
        desafioEncontrado = possivel;
        categoriaImagem = cat;
        break;
      }
    }
    if (desafioEncontrado) {
      desafiosPendentes[from] = { ...desafioEncontrado, categoria: categoriaImagem };
      salvarMemoria();
      await enviarMensagemWhatsApp(from, `🔍 Charada visual:

${desafioEncontrado.enunciado}`);
      if (desafioEncontrado.midia) await enviarMidiaWhatsApp(from, desafioEncontrado.midia, desafioEncontrado.tipo);
    } else {
      await enviarMensagemWhatsApp(from, 'Ainda não tenho uma charada visual no momento! 😕');
    }
    return res.sendStatus(200);
  }

  const resposta = await gerarRespostaIA(texto);
  await enviarMensagemWhatsApp(from, resposta);
  res.sendStatus(200);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Lumi está rodando na porta ${PORT}`);
});
