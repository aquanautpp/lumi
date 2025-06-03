import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cron from 'node-cron';

import { enviarMensagemWhatsApp, enviarMidiaWhatsApp } from './utils/whatsapp.js';
import { desafios, escolherDesafioPorCategoria } from './utils/desafios.js';
import { memoriaUsuarios, desafiosPendentes, salvarMemoria } from './utils/memoria.js';
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
  const { from, texto } = req.body;
  if (!from || !texto) return res.sendStatus(400);

  // Verifica se é resposta do teste de estilo
  const respondeuEstilo = await processarRespostaEstilo(from, texto);
  if (respondeuEstilo) return res.sendStatus(200);

  // Atualiza interações do usuário
  const usuario = memoriaUsuarios[from] || { interacoes: 0 };
  usuario.interacoes += 1;
  memoriaUsuarios[from] = usuario;
  salvarMemoria();

  if (usuario.interacoes >= 5 && usuario.interacoes <= 8 && !(usuario.estilo?.concluido)) {
    await aplicarPerguntaEstilo(from);
    return res.sendStatus(200);
  }

  // Verifica se há desafio pendente
  const desafioPendente = desafiosPendentes[from];
  if (desafioPendente) {
    const acertou = validarResposta(texto, desafioPendente.resposta, desafioPendente.sinonimos || []);
    atualizarMemoria(from, desafioPendente.categoria, acertou, texto, desafioPendente.resposta);

    const feedback = gerarFeedback(acertou, desafioPendente.categoria);
    const falaMascote = getFala(acertou ? 'acerto' : 'erro');

    await enviarMensagemWhatsApp(from, feedback);
    await enviarMensagemWhatsApp(from, falaMascote);

    const msgNivel = verificarNivel(memoriaUsuarios[from]);
    if (msgNivel) {
      await enviarMensagemWhatsApp(from, msgNivel);
      await enviarMensagemWhatsApp(from, getFala('nivel'));
    }

    delete desafiosPendentes[from];
    salvarMemoria();
    return res.sendStatus(200);
  }

  // Solicitação de desafio
  const textoLower = texto.toLowerCase();
  if (textoLower.includes('quero') || textoLower.includes('desafio') || textoLower.includes('pode mandar')) {
    const desafioHoje = obterDesafioDoDia();
    const desafio = escolherDesafioPorCategoria(desafioHoje.categoria, desafioHoje.dificuldade);
    desafiosPendentes[from] = desafio;
    salvarMemoria();

    const mensagem = `📅 Hoje é dia de *${desafioHoje.categoria}*!\n\n🧠 ${desafio.pergunta}`;
    await enviarMensagemWhatsApp(from, mensagem);
    return res.sendStatus(200);
  }

  // Se não for desafio, nem estilo — usa IA
  const resposta = await gerarRespostaIA(texto);
  await enviarMensagemWhatsApp(from, resposta);
  res.sendStatus(200);
});

// Relatórios semanais (domingo 9h)
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

// Desafio em família (domingo 10h)
cron.schedule('0 10 * * 0', () => {
  const desafio = '🌟 Desafio em família: Cada um deve dizer um número. Quem disser o maior ganha!';
  for (const numero of Object.keys(memoriaUsuarios)) {
    enviarMensagemWhatsApp(numero, desafio);
  }
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

app.listen(PORT, () => {
  console.log(`🚀 Lumi está rodando na porta ${PORT}`);
});
