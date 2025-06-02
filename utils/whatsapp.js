import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.PHONE_ID;

async function enviarMensagemWhatsApp(numero, mensagem) {
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
          Authorization: `Bearer ${TOKEN}`
        }
      }
    );
    return resposta.data;
  } catch (erro) {
    console.error('Erro ao enviar mensagem:', erro.response?.data || erro.message);
  }
}

async function enviarMidiaWhatsApp(numero, urlArquivo, tipo = 'image') {
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
          Authorization: `Bearer ${TOKEN}`
        }
      }
    );
    return resposta.data;
  } catch (erro) {
    console.error('Erro ao enviar mídia:', erro.response?.data || erro.message);
  }
}

export { enviarMensagemWhatsApp, enviarMidiaWhatsApp };
