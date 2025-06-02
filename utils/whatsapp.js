// utils/whatsapp.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.WHATSAPP_TOKEN;
const phoneId = process.env.WHATSAPP_PHONE_ID;

export async function enviarMensagemWhatsApp(numero, mensagem) {
  try {
    await axios.post(
      `https://graph.facebook.com/v19.0/${phoneId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: numero,
        type: 'text',
        text: { body: mensagem }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`Mensagem enviada para ${numero}`);
  } catch (erro) {
    console.error('Erro ao enviar mensagem:', erro.response?.data || erro.message);
  }
}
