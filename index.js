// index.js (Webhook principal com integração completa)
import express from 'express';
import fs from 'fs';
import dotenv from 'dotenv';
import { enviarMensagemWhatsApp } from './utils/mensagem.js';
import { enviarMidiaWhatsApp, enviarAudioWhatsApp } from './utils/midia.js';
import { desafios } from './utils/desafios.js';
import { desafiosPendentes, memoriaUsuarios, salvarMemoria, carregarMemoria } from './utils/memoria.js';
import { validarResposta } from './utils/validacao.js';
import { gerarFeedback } from './utils/feedback.js';
import { atualizarMemoria } from './utils/historico.js';
import { verificarNivel } from './utils/niveis.js';
import './utils/agendamentos.js';

dotenv.config();
carregarMemoria();

const app = express();
app.use(express.json());

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
    if (mensagemNivel) await enviarMensagemWhatsApp(from, mensagemNivel);

    if (acertou) delete desafiosPendentes[from];
  }
  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log('🚀 Lumi rodando na porta 3000!');
});
