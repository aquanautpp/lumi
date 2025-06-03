import axios from 'axios';
import dotenv from 'dotenv';
import { memoriaUsuarios } from './memoria.js';

dotenv.config();

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.FROM_PHONE_ID;

export async function enviarMensagemWhatsApp(numero, mensagem, tentativa = 1) {
  const usuario = memoriaUsuarios[numero];
  if (usuario && usuario.modoSussurro) {
    mensagem = "🤫 " + mensagem;
  }
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
    console.log(`Mensagem enviada para ${numero}: ${mensagem}`);
    return resposta.data;
  } catch (erro) {
    const code = erro.response?.status;
    if ((code >= 500 && code < 600 || erro.code === 'ECONNABORTED') && tentativa < 3) {
      const atraso = 1000 * Math.pow(2, tentativa); // 2s, 4s, 8s
      console.log(`🔁 Tentando novamente em ${atraso / 1000}s...`);
      await new Promise(res => setTimeout(res, atraso));
      return enviarMensagemWhatsApp(numero, mensagem, tentativa + 1);
    }
    console.error(`⚠️ Erro ao enviar mensagem (tentativa ${tentativa}) para ${numero}:`, erro.response?.data || erro.message);
    throw erro;
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
    console.log(`Mídia enviada para ${numero}: ${urlArquivo}`);
    return resposta.data;
  } catch (erro) {
    console.error('Erro ao enviar mídia:', erro.response?.data || erro.message);
    throw erro;
  }
}
