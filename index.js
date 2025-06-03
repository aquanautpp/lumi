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

app.post('/webhook', async (req, res) => {
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message) return res.sendStatus(200);

  const from = message.from;
  const texto = message.text?.body || '';
  const textoLower = texto.toLowerCase();

  // Handle mission requests
  if (textoLower.includes('quero a missão do dia') || textoLower.includes('qual é minha missão hoje?')) {
    if (!missoesPendentes[from]) {
      const estilo = memoriaUsuarios[from]?.estilo?.tipo || null;
      const missao = gerarMissao(estilo);
      if (missao) {
        missoesPendentes[from] = {
          desafios: missao,
          atual: 0
        };
        salvarMemoria();
        const desafio = missao[0];
        const mensagem = `🎯 *Missão do Dia* iniciada! Aqui vai seu primeiro desafio (${desafio.categoria}):\n\n🧠 ${desafio.enunciado}`;
        await enviarMensagemWhatsApp(from, mensagem);
        if (desafio.midia) {
          await enviarMidiaWhatsApp(from, desafio.midia, desafio.tipo === 'image' ? 'image' : 'video');
        }
      } else {
        await enviarMensagemWhatsApp(from, 'Desculpe, não consegui criar uma missão agora. Tente novamente mais tarde!');
      }
    } else {
      await enviarMensagemWhatsApp(from, 'Você já tem uma missão em andamento! Continue respondendo aos desafios.');
    }
    return res.sendStatus(200);
  }

  // Handle mission progress
  if (missoesPendentes[from]) {
    const missao = missoesPendentes[from];
    const desafioAtual = missao.desafios[missao.atual];
    const acertou = validarResposta(texto, desafioAtual.resposta, desafioAtual.sinonimos || []);

    atualizarMemoria(from, desafioAtual.categoria, acertou, texto, desafioAtual.resposta);
    const estilo = memoriaUsuarios[from]?.estilo?.tipo || null;
    const feedback = gerarFeedback(acertou, estilo);
    await enviarMensagemWhatsApp(from, feedback);
    if (!memoriaUsuarios[from]?.modoSussurro) {
      const falaMascote = getFala(acertou ? 'acerto' : 'erro');
      await enviarMensagemWhatsApp(from, falaMascote);
    }

    if (acertou) {
      missao.atual += 1;
      if (missao.atual < 3) {
        const proximoDesafio = missao.desafios[missao.atual];
        const mensagem = `🎉 Parabéns! Aqui vai o próximo desafio (${proximoDesafio.categoria}):\n\n🧠 ${proximoDesafio.enunciado}`;
        await enviarMensagemWhatsApp(from, mensagem);
        if (proximoDesafio.midia) {
          await enviarMidiaWhatsApp(from, proximoDesafio.midia, proximoDesafio.tipo === 'image' ? 'image' : 'video');
        }
      } else {
        await enviarMensagemWhatsApp(from, '🎉 Missão completa! Você é demais! Aqui vai um selo especial: 🥇✨');
        const msgNivel = verificarNivel(memoriaUsuarios[from]);
        if (msgNivel) {
          await enviarMensagemWhatsApp(from, msgNivel);
          if (!memoriaUsuarios[from]?.modoSussurro) {
            await enviarMensagemWhatsApp(from, getFala('nivel'));
          }
        }
        delete missoesPendentes[from];
        salvarMemoria();
      }
    } else {
      await enviarMensagemWhatsApp(from, '😊 Quase lá! Vamos tentar de novo? A missão foi reiniciada.');
      const estilo = memoriaUsuarios[from]?.estilo?.tipo || null;
      const novaMissao = gerarMissao(estilo);
      if (novaMissao) {
        missoesPendentes[from] = {
          desafios: novaMissao,
          atual: 0
        };
        salvarMemoria();
        const primeiroDesafio = novaMissao[0];
        const mensagem = `🧠 Aqui vai seu primeiro desafio novamente (${primeiroDesafio.categoria}):\n\n${primeiroDesafio.enunciado}`;
        await enviarMensagemWhatsApp(from, mensagem);
        if (primeiroDesafio.midia) {
          await enviarMidiaWhatsApp(from, primeiroDesafio.midia, primeiroDesafio.tipo === 'image' ? 'image' : 'video');
        }
      } else {
        await enviarMensagemWhatsApp(from, 'Desculpe, não consegui criar uma nova missão. Tente novamente mais tarde!');
        delete missoesPendentes[from];
        salvarMemoria();
      }
    }
    return res.sendStatus(200);
  }

  // Existing logic for normal challenges and other features
  if (textoLower.includes('ativar modo sussurro')) {
    await alternarModoSussurro(from, true);
    return res.sendStatus(200);
  } else if (textoLower.includes('desativar modo sussurro')) {
    await alternarModoSussurro(from, false);
    return res.sendStatus(200);
  }

  const respondeuEstilo = await processarRespostaEstilo(from, texto);
  if (respondeuEstilo) return res.sendStatus(200);

  const usuario = memoriaUsuarios[from] || { interacoes: 0 };
  usuario.interacoes += 1;
  memoriaUsuarios[from] = usuario;
  salvarMemoria();

  if (usuario.interacoes >= 5 && usuario.interacoes <= 8 && !(usuario.estilo?.concluido)) {
    await aplicarPerguntaEstilo(from);
    return res.sendStatus(200);
  }

  const desafioPendente = desafiosPendentes[from];
  if (desafioPendente) {
    const acertou = validarResposta(texto, desafioPendente.resposta, desafioPendente.sinonimos || []);
    atualizarMemoria(from, desafioPendente.categoria, acertou, texto, desafioPendente.resposta);

    const estilo = memoriaUsuarios[from]?.estilo?.tipo || null;
    const feedback = gerarFeedback(acertou, estilo);
    await enviarMensagemWhatsApp(from, feedback);
    if (!memoriaUsuarios[from]?.modoSussurro) {
      const falaMascote = getFala(acertou ? 'acerto' : 'erro');
      await enviarMensagemWhatsApp(from, falaMascote);
    }

    const msgNivel = verificarNivel(memoriaUsuarios[from]);
    if (msgNivel) {
      await enviarMensagemWhatsApp(from, msgNivel);
      if (!memoriaUsuarios[from]?.modoSussurro) {
        await enviarMensagemWhatsApp(from, getFala('nivel'));
      }
    }

    delete desafiosPendentes[from];
    salvarMemoria();
    return res.sendStatus(200);
  }

  if (textoLower.includes('quero') || textoLower.includes('desafio') || textoLower.includes('pode mandar')) {
    const desafioHoje = obterDesafioDoDia();
    const estilo = memoriaUsuarios[from]?.estilo?.tipo || null;
    const desafio = estilo ? selecionarDesafioPorCategoriaEEstilo(desafioHoje.categoria, estilo) : escolherDesafioPorCategoria(desafioHoje.categoria);
    desafiosPendentes[from] = desafio;
    salvarMemoria();

    const mensagem = `📅 Hoje é dia de *${desafioHoje.categoria}*!\n\n🧠 ${desafio.enunciado}`;
    await enviarMensagemWhatsApp(from, mensagem);
    if (desafio.midia) {
      await enviarMidiaWhatsApp(from, desafio.midia, desafio.tipo === 'image' ? 'image' : 'video');
    }
    return res.sendStatus(200);
  }

  const resposta = await gerarRespostaIA(texto);
  await enviarMensagemWhatsApp(from, resposta);
  res.sendStatus(200);
});

app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
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

    await generatePdfReport({
      nome: usuario.nome || 'Aluno(a)',
      numero,
      progresso: usuario.historico,
      caminho
    });

    const url = await uploadPdfToCloudinary(caminho);
    await enviarMidiaWhatsApp(numero, url, 'document');

    await enviarMensagemWhatsApp(numero, getFala('ausencia'));
  }
});

cron.schedule('0 10 * * 0', () => {
  const desafio = '🌟 Desafio em família: Cada um deve dizer um número. Quem disser o maior ganha!';
  for (const numero of Object.keys(memoriaUsuarios)) {
    enviarMensagemWhatsApp(numero, desafio);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Lumi está rodando na porta ${PORT}`);
});
