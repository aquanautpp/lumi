import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { enviarMensagemWhatsApp, enviarMidiaWhatsApp } from './utils/whatsapp.js';
import { desafios } from './utils/desafios.js';
import { salvarMemoria, memoriaUsuarios, desafiosPendentes } from './utils/memoria.js';
import { gerarPdfRelatorio } from './utils/pdf.js';
import { uploadPdfToCloudinary } from './utils/cloudinary.js';
import { gerarFeedback } from './utils/feedback.js';
import { atualizarMemoria } from './utils/historico.js';
import { verificarNivel } from './utils/niveis.js';
import { validarResposta } from './utils/validacao.js';
import cron from 'node-cron';
import { gerarRespostaIA } from './utils/ia.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Webhook principal
app.post('/webhook', async (req, res) => {
  const { from, texto } = req.body;
  const desafioPendente = desafiosPendentes[from];

  if (desafioPendente) {
    const acertou = validarResposta(texto, desafioPendente.resposta, desafioPendente.sinonimos || []);
    atualizarMemoria(from, desafioPendente.categoria, acertou, texto, desafioPendente.resposta);

    const feedback = gerarFeedback(acertou, desafioPendente.categoria);
    await enviarMensagemWhatsApp(from, feedback);

    const usuario = memoriaUsuarios[from];
    const mensagemNivel = verificarNivel(usuario);
    if (mensagemNivel) {
      await enviarMensagemWhatsApp(from, mensagemNivel);
    }

    if (acertou) delete desafiosPendentes[from];
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
    await gerarPdfRelatorio({ nome: usuario.nome || 'Aluno(a)', numero, progresso: usuario.historico, caminho });
    const url = await uploadPdfToCloudinary(caminho);
    await enviarMidiaWhatsApp(numero, 'document', url);
  }
});

// Desafio em família todo domingo às 10h
cron.schedule('0 10 * * 0', () => {
  const desafiosFamilia = [
    { enunciado: 'Cada um deve dizer um número. Quem disser o maior ganha!', tipo: 'cinestesico' }
  ];
  for (const numero of Object.keys(memoriaUsuarios)) {
    const desafio = desafiosFamilia[0]; // ou aleatório no futuro
    enviarMensagemWhatsApp(numero, `🌟 Desafio em família: ${desafio.enunciado}`);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Lumi está rodando na porta ${PORT}`);
});
