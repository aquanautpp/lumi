import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
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
import cron from 'node-cron';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Webhook principal
app.post('/webhook', async (req, res) => {
  const mensagem = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  const from = mensagem?.from;
  const texto = mensagem?.text?.body;

  if (!from || !texto) {
    console.warn('Mensagem malformada recebida:', JSON.stringify(req.body, null, 2));
    return res.sendStatus(200); // evita crash e responde OK para Meta
  }

  const desafioPendente = desafiosPendentes[from];

  // Verifica se é uma resposta do teste de estilo
  const respondeuEstilo = await processarRespostaEstilo(from, texto);
  if (respondeuEstilo) return res.sendStatus(200);

  // Aplica pergunta automática entre 5ª e 8ª interação
  const usuario = memoriaUsuarios[from] || { interacoes: 0 };
  usuario.interacoes = (usuario.interacoes || 0) + 1;
  memoriaUsuarios[from] = usuario;
  salvarMemoria();

  if (usuario.interacoes >= 5 && usuario.interacoes <= 8 && !(usuario.estilo?.concluido)) {
    await aplicarPerguntaEstilo(from);
    return res.sendStatus(200);
  }

  if (desafioPendente) {
    const acertou = validarResposta(texto, desafioPendente.resposta, desafioPendente.sinonimos || []);
    atualizarMemoria(from, desafioPendente.categoria, acertou, texto, desafioPendente.resposta);

    const feedback = gerarFeedback(acertou, desafioPendente.categoria);
    const falaMascote = getFala(acertou ? 'acerto' : 'erro');

    await enviarMensagemWhatsApp(from, feedback);
    await enviarMensagemWhatsApp(from, falaMascote);

    const mensagemNivel = verificarNivel(memoriaUsuarios[from]);
    if (mensagemNivel) {
      await enviarMensagemWhatsApp(from, mensagemNivel);
      await enviarMensagemWhatsApp(from, getFala('nivel'));
    }
  } else if (
    texto.toLowerCase().includes("quero") ||
    texto.toLowerCase().includes("desafio") ||
    texto.toLowerCase().includes("pode mandar")
  ) {
    const desafioHoje = obterDesafioDoDia();
    const desafio = escolherDesafioPorCategoria(desafioHoje.categoria, desafioHoje.dificuldade);
    desafiosPendentes[from] = desafio;

    const mensagem = `📅 Hoje é dia de *${desafioHoje.categoria}*!\n\n🧠 ${desafio.pergunta}`;
    await enviarMensagemWhatsApp(from, mensagem);
  } else {
    const resposta = await gerarRespostaIA(texto);
    await enviarMensagemWhatsApp(from, resposta);
  }

  res.sendStatus(200);
});

// Envio automático de relatórios em PDF todo domingo às 9h
cron.schedule('0 9 * * 0', async () => {
  for (const numero of Object.keys(memoriaUsuarios)) {
    const usuario = memoriaUsuarios[numero];
    const caminho = `tmp/relatorio-${numero}.pdf`;
    await generatePdfReport({ nome: usuario.nome || 'Aluno(a)', numero, progresso: usuario.historico, caminho });
    const url = await uploadPdfToCloudinary(caminho);
    await enviarMidiaWhatsApp(numero, 'document', url);

    const falaMascote = getFala('ausencia');
    await enviarMensagemWhatsApp(numero, falaMascote);
  }
});

// Desafio em família todo domingo às 10h
cron.schedule('0 10 * * 0', () => {
  const desafiosFamilia = [
    { enunciado: 'Cada um deve dizer um número. Quem disser o maior ganha!', tipo: 'cinestesico' }
  ];
  for (const numero of Object.keys(memoriaUsuarios)) {
    const desafio = desafiosFamilia[0];
    enviarMensagemWhatsApp(numero, `🌟 Desafio em família: ${desafio.enunciado}`);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Lumi está rodando na porta ${PORT}`);
});
