import express from 'express';
import OpenAI from 'openai';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Carrega variáveis do .env
dotenv.config();

// Configuração de caminhos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App Express
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Variáveis de ambiente
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const FROM_PHONE_ID = process.env.FROM_PHONE_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'lumi123';

// Estado em memória
const userProgress = {};
const desafiosPendentes = {};

// Desafios disponíveis
const desafios = {
  matematica: [
    { enunciado: 'Se você tem 8 balas e dá 3 para seu amigo, com quantas fica?', resposta: '5' },
    { enunciado: 'Quanto é 7 x 6?', resposta: '42' }
  ],
  logica: [
    { enunciado: 'Sou par e maior que 10, mas menor que 14. Quem sou eu?', resposta: '12' }
  ],
  portugues: [
    { enunciado: 'Qual é o plural de "cão"?', resposta: 'cães' }
  ]
};

// Funções utilitárias
function escolherDesafioAleatorio() {
  const categorias = Object.keys(desafios);
  const categoria = categorias[Math.floor(Math.random() * categorias.length)];
  const desafio = desafios[categoria][Math.floor(Math.random() * desafios[categoria].length)];
  return { categoria, ...desafio };
}

function fraseMotivacional(acertou) {
  return acertou
    ? 'Mandou bem! Isso é pensar com lógica 🎯'
    : 'Quase! Vamos tentar de novo juntos? 💡';
}

function salvarProgresso(numero, categoria, acertou) {
  if (!userProgress[numero]) userProgress[numero] = [];
  userProgress[numero].push({ categoria, acertou, data: new Date() });
}

// Envio de mensagens via API do WhatsApp (Meta)
async function enviarMensagemWhatsApp(to, mensagem) {
  try {
    await fetch(`https://graph.facebook.com/v20.0/${FROM_PHONE_ID}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: mensagem }
      })
    });
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem pelo WhatsApp:', error);
  }
}

// Webhook para recebimento de mensagens
app.post('/webhook', async (req, res) => {
  const body = req.body;
  if (!body?.entry?.[0]?.changes?.[0]?.value?.messages) return res.sendStatus(200);

  const message = body.entry[0].changes[0].value.messages[0];
  const from = message.from;
  const texto = message.text?.body?.toLowerCase() || '';

  console.log(`📩 Mensagem recebida de ${from}: "${texto}"`);

  // Respostas diretas
  if (texto.includes('quem criou') || texto.includes('criador')) {
    await enviarMensagemWhatsApp(from, 'Fui criada por Victor Pires! 💡');
    return res.sendStatus(200);
  }

  // Verificação de desafio pendente
  if (desafiosPendentes[from]) {
    const esperado = desafiosPendentes[from];
    const acertou = texto.trim() === esperado.resposta;
    const feedback = fraseMotivacional(acertou);
    await enviarMensagemWhatsApp(from, feedback);
    salvarProgresso(from, esperado.categoria, acertou);
    delete desafiosPendentes[from];
    return res.sendStatus(200);
  }

  // Início de nova interação + desafio
  const { categoria, enunciado, resposta } = escolherDesafioAleatorio();
  desafiosPendentes[from] = { categoria, resposta };

  const prompt = `Você é a Lumi, tutora virtual. A criança disse: "${texto}". Responda de forma simples, divertida e clara, e termine com uma pergunta para engajar.`;

  try {
    const respostaAI = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 200
    });

    const textoGerado = respostaAI.choices[0].message.content.trim();
    const final = `${textoGerado}\n\nQuer um desafio? É só dizer "quero um desafio!"`;
    await enviarMensagemWhatsApp(from, final);
  } catch (err) {
    console.error('❌ Erro com o GPT:', err);
    await enviarMensagemWhatsApp(from, 'Opa! Tive um probleminha. Pode tentar de novo?');
  }

  res.sendStatus(200);
});

// Verificação inicial de webhook (GET)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verificado com sucesso!');
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Verificação falhou');
  }
});

// Inicializa o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Lumi rodando na porta ${PORT}`);
});
