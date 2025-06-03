// utils/whatsapp.js ATUALIZADO – inclui retry automático e log de falha
import axios from 'axios';
import dotenv from 'dotenv';
import { memoriaUsuarios } from './memoria.js';
import fs from 'fs';

dotenv.config();

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.PHONE_ID;

export async function enviarMensagemWhatsApp(numero, mensagem, tentativa = 1) {
  const usuario = memoriaUsuarios[numero];
  if (usuario?.modoSussurro) mensagem = '🤫 ' + mensagem;

  try {
    const resposta = await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: numero,
        type: 'text',
        text: { body: mensagem }
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`📤 Mensagem enviada para ${numero}: ${mensagem}`);
    return resposta.data;
  } catch (erro) {
    const code = erro.response?.status;
    const logMsg = `❌ Erro ao enviar mensagem (tentativa ${tentativa}) para ${numero}: ${mensagem} – ${erro.response?.data?.error?.message || erro.message}`;
    console.error(logMsg);
    fs.appendFileSync('mensagens_falhas.txt', `\n[${new Date().toISOString()}] ${logMsg}`);

    if ((code >= 500 || erro.code === 'ECONNABORTED') && tentativa < 3) {
      await new Promise(res => setTimeout(res, 2000 * tentativa));
      return enviarMensagemWhatsApp(numero, mensagem, tentativa + 1);
    }
    return null;
  }
}

export async function enviarMidiaWhatsApp(numero, urlArquivo, tipo = 'image') {
  try {
    const resposta = await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: numero,
        type: tipo,
        [tipo]: {
          link: urlArquivo
        }
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`📤 Mídia enviada para ${numero}: ${urlArquivo}`);
    return resposta.data;
  } catch (erro) {
    console.error(`❌ Erro ao enviar mídia para ${numero}:`, erro.response?.data || erro.message);
    return null;
  }
}
