// utils/whatsapp.js
import axios from 'axios';
import dotenv from 'dotenv';
import { memoriaUsuarios } from './memoria.js';
import { promises as fs } from 'fs';
import { twilioClient, usingTwilio as USING_TWILIO, twilioNumber as TWILIO_WHATSAPP_NUMBER } from '../src/lib/twilioClient.js';

dotenv.config();

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.PHONE_ID || process.env.FROM_PHONE_ID;
// Twilio configuration is handled in src/lib/twilioClient.js
const LOG_PATH = 'mensagens_falhas.txt';

export async function enviarMensagemWhatsApp(numero, mensagem, opcoes = null, tentativa = 1) {
  const usuario = memoriaUsuarios[numero] || {};
  
  if (usuario?.nome) {
    mensagem = mensagem.replace(/\{nome\}/gi, usuario.nome);
    if (!usuario.saudado) {
      usuario.saudado = true;
      if (!mensagem.startsWith(usuario.nome)) {
        mensagem = `${usuario.nome}, ${mensagem}`;
      }
    }
  }

  if (usuario?.modoSussurro) mensagem = "🤫 " + mensagem;

  if (global.__twiMLMessages) {
  if (opcoes && opcoes.length) {
      const lista = opcoes.map((b, i) => `${i + 1}. ${b.title}`).join('\n');
      mensagem = `${mensagem}\n\n${lista}`;
      usuario.menuAtual = opcoes;
    } else {
      delete usuario.menuAtual;
    }
    global.__twiMLMessages.push({ body: mensagem });
    return { local: true };
  }

  if (USING_TWILIO) {
    if (opcoes && opcoes.length) {
      const lista = opcoes.map((b, i) => `${i + 1}. ${b.title}`).join('\n');
      mensagem = `${mensagem}\n\n${lista}`;
    }

      try {
      const fromNumber = TWILIO_WHATSAPP_NUMBER.startsWith('whatsapp:')
        ? TWILIO_WHATSAPP_NUMBER
        : `whatsapp:${TWILIO_WHATSAPP_NUMBER}`;
      const resp = await twilioClient.messages.create({
        from: fromNumber,
        to: `whatsapp:${numero}`,
        body: mensagem
      });
      console.log(`✅ Mensagem enviada (Twilio) para ${numero}: ${mensagem}`);
      return resp;
    } catch (erro) {
      const log = `[${new Date().toISOString()}] Falha Twilio para ${numero}: ${mensagem} - Erro: ${erro.response?.data?.message || erro.message}\n`;
      await fs.appendFile(LOG_PATH, log);
      console.error('❌ Erro ao enviar mensagem via Twilio:', erro.response?.data || erro.message);
      if (erro.code === 63018) {
        await enviarMensagemWhatsApp(numero, 'Seu número não está autorizado a receber mensagens deste remetente.');
      }
      throw erro;
    }
  }

  const payload = {
    messaging_product: 'whatsapp',
    to: numero,
  };

  if (opcoes && Array.isArray(opcoes) && opcoes.length) {
    payload.type = 'interactive';
    payload.interactive = {
      type: 'button',
      body: { text: mensagem },
      action: {
        buttons: opcoes.slice(0, 3).map((b, i) => ({
          type: 'reply',
          reply: { id: String(i + 1), title: b.title }
        }))
      }
    };
    usuario.menuAtual = opcoes;
  } else {
    payload.type = 'text';
    payload.text = { body: mensagem };
    delete usuario.menuAtual;
  }
  
  try {
    const resposta = await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_ID}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      }
    );
    console.log(`✅ Mensagem enviada para ${numero}: ${mensagem}`);
    return resposta.data;
  } catch (erro) {
    const code = erro.response?.status;
    if ((code >= 500 || erro.code === 'ECONNABORTED') && tentativa < 3) {
      const atraso = 1000 * Math.pow(2, tentativa); // 2s, 4s, 8s
      console.log(`🔁 Tentando novamente em ${atraso / 1000}s...`);
      await new Promise(res => setTimeout(res, atraso));
       return enviarMensagemWhatsApp(numero, mensagem, opcoes, tentativa + 1);
    }
    const log = `[${new Date().toISOString()}] Falha para ${numero}: ${mensagem} - Erro: ${erro.response?.data?.error?.message || erro.message}\n`;
    await fs.appendFile(LOG_PATH, log);
    console.error(`❌ Erro ao enviar mensagem (tentativa ${tentativa}) para ${numero}:`, erro.response?.data || erro.message);
    throw erro;
  }
}

export async function enviarMidiaWhatsApp(numero, urlArquivo, tipo = 'image') {
    if (global.__twiMLMessages) {
    global.__twiMLMessages.push({ body: '', media: urlArquivo });
    return { local: true };
  }
  if (USING_TWILIO) {
    try {
        const fromNumber = TWILIO_WHATSAPP_NUMBER.startsWith('whatsapp:')
        ? TWILIO_WHATSAPP_NUMBER
        : `whatsapp:${TWILIO_WHATSAPP_NUMBER}`;
      const resp = await twilioClient.messages.create({
        from: fromNumber,
        to: `whatsapp:${numero}`,
        mediaUrl: urlArquivo,
        body: ''
      });
      console.log(`✅ Mídia enviada (Twilio) para ${numero}: ${urlArquivo}`);
      return resp;
    } catch (erro) {
      const log = `[${new Date().toISOString()}] Falha de mídia Twilio para ${numero}: ${urlArquivo} - Erro: ${erro.response?.data?.message || erro.message}\n`;
      await fs.appendFile(LOG_PATH, log);
      console.error('❌ Erro ao enviar mídia via Twilio:', erro.response?.data || erro.message);
      if (erro.code === 63018) {
        await enviarMensagemWhatsApp(numero, 'Seu número não está autorizado a receber mensagens deste remetente.');
      }
      throw erro;
    }
  }

  try {
    const resposta = await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: numero,
        type: tipo,
        [tipo]: { link: urlArquivo }
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`✅ Mídia enviada para ${numero}: ${urlArquivo}`);
    return resposta.data;
  } catch (erro) {
    const log = `[${new Date().toISOString()}] Falha de mídia para ${numero}: ${urlArquivo} - Erro: ${erro.response?.data?.error?.message || erro.message}\n`;
    await fs.appendFile(LOG_PATH, log);
    console.error('❌ Erro ao enviar mídia:', erro.response?.data || erro.message);
    throw erro;
  }
}
