import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { enviarMensagemWhatsApp, enviarMidiaWhatsApp } from './utils/whatsapp.js';
import { desafios, selecionarDesafioPorCategoriaEEstilo, escolherDesafioPorCategoria } from './utils/desafios.js';
import { memoriaUsuarios, desafiosPendentes, salvarMemoria, alternarModoSussurro } from './utils/memoria.js';
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
import { enviarJogoVisual } from './utils/jogosVisuais.js';
import { enviarDesafioVidaReal } from './utils/desafiosVidaReal.js';
import { enviarDesafioFamilia } from './utils/desafioFamilia.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Endpoint para cápsula do tempo
app.post('/capsula', async (req, res) => {
  const { from, mensagem, dias } = req.body;
  if (!from || !mensagem || !dias) return res.sendStatus(400);
  if (!memoriaUsuarios[from]) memoriaUsuarios[from] = {};
  memoriaUsuarios[from].capsula = {
    mensagem,
    dataReenvio: new Date(Date.now() + dias * 24 * 60 * 60 * 1000)
  };
  salvarMemoria();
  await enviarMensagemWhatsApp(from, `🎁 Sua cápsula do tempo foi guardada! Você a receberá em ${dias} dias.`);
  res.sendStatus(200);
});

// Cron job para enviar cápsulas do tempo
cron.schedule('0 0 * * *', async () => {
  const agora = new Date();
  for (const [numero, usuario] of Object.entries(memoriaUsuarios)) {
    if (usuario.capsula && new Date(usuario.capsula.dataReenvio) <= agora) {
      await enviarMensagemWhatsApp(numero, `🎁 Sua cápsula do tempo chegou! Você disse: "${usuario.capsula.mensagem}"`);
      delete usuario.capsula;
      salvarMemoria();
    }
  }
});

// Cron job para enviar desafios da vida real a cada 2 dias às 9h
cron.schedule('0 9 */2 * *', async () => {
  for (const numero of Object.keys(memoriaUsuarios)) {
    await enviarDesafioVidaReal(numero);
  }
});

// Cron job para enviar desafios em família todo domingo às 10h
cron.schedule('0 10 * * 0', async () => {
  for (const numero of Object.keys(memoriaUsuarios)) {
    await enviarDesafioFamilia(numero);
  }
});

// Endpoint de teste local (opcional)
app.post('/teste-local', async (req, res) => {
  const { from, texto } = req.body;
  if (!from || !texto) return res.sendStatus(400);

  if (texto.toLowerCase().includes('ativar modo sussurro')) {
    await alternarModoSussurro(from, true);
    return res.sendStatus(200);
  }
  if (texto.toLowerCase().includes('desativar modo sussurro')) {
    await alternarModoSussurro(from, false);
    return res.sendStatus(200);
  }

  if (texto.toLowerCase().includes('quero um jogo visual')) {
    await enviarJogoVisual(from);
    return res.sendStatus(200);
  }

  // Adicione aqui mais lógica, se necessário
});

// Webhook da Meta (substitua pela sua lógica existente)
app.post('/webhook', async (req, res) => {
  // Sua lógica de webhook aqui...
});

// Verificação do webhook
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

app.listen(PORT, () => {
  console.log(`🚀 Lumi está rodando na porta ${PORT}`);
});
