// index.js ATUALIZADO (com correções dos erros 1 a 13)
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

  // ❌ ERRO 7 – Permitir sair da missão/desafio
  if (["parar", "cancelar", "chega"].some(cmd => textoLower.includes(cmd))) {
    delete desafiosPendentes[from];
    delete missoesPendentes[from];
    await enviarMensagemWhatsApp(from, 'Tudo bem! Se quiser voltar depois, estarei por aqui 💜');
    salvarMemoria();
    return res.sendStatus(200);
  }

  // ❌ ERRO 12 – Bloquear resposta automática da IA em espanhol
  if (textoLower.includes('gracias') || textoLower.includes('ayuda')) {
    await enviarMensagemWhatsApp(from, 'Posso responder em português ou inglês! 😊');
    return res.sendStatus(200);
  }

  // ❌ ERRO 13 – Pedir resposta correta
  if (textoLower.includes('qual era a resposta')) {
    const desafio = desafiosPendentes[from] || missoesPendentes[from]?.desafios?.[missoesPendentes[from]?.atual];
    if (desafio) {
      await enviarMensagemWhatsApp(from, `🧠 A resposta correta era: *${desafio.resposta}*`);
    } else {
      await enviarMensagemWhatsApp(from, 'Não encontrei nenhum desafio ativo agora.');
    }
    return res.sendStatus(200);
  }

  // ❌ ERRO 1 – Responder perguntas abertas com IA
  const perguntasAbertas = ['quem é você', 'o que você faz', 'como funciona', 'lumi'];
  if (perguntasAbertas.some(p => textoLower.includes(p))) {
    const resposta = await gerarRespostaIA(texto);
    await enviarMensagemWhatsApp(from, resposta);
    return res.sendStatus(200);
  }

  // Lógica de missão...
  // (mantida como no seu código, mas validação corrigida no erro 2)

  // ❌ ERRO 2 – Corrigir validação da missão
  if (missoesPendentes[from]) {
    const missao = missoesPendentes[from];
    const desafioAtual = missao.desafios[missao.atual];
    const acertou = validarResposta(texto, desafioAtual.resposta, desafioAtual.sinonimos || []);

    atualizarMemoria(from, desafioAtual.categoria, acertou, texto, desafioAtual.resposta);
    const estilo = memoriaUsuarios[from]?.estilo?.tipo || null;
    const feedback = gerarFeedback(acertou, estilo);
    await enviarMensagemWhatsApp(from, `🐶 *Luzinho diz:* ${feedback}`);

    if (!memoriaUsuarios[from]?.modoSussurro) {
      await enviarMensagemWhatsApp(from, getFala(acertou ? 'acerto' : 'erro'));
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

  // Restante do seu código segue como está...
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Lumi está rodando na porta ${PORT}`);
});
