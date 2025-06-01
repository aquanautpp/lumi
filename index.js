import express from 'express';
import OpenAI from 'openai';

const app = express();
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const FROM_PHONE = process.env.FROM_PHONE;

console.log("Iniciando o Lumi...");

app.post('/webhook', async (req, res) => {
  console.log("Webhook recebeu uma mensagem:", req.body);

  const msg = req.body;
  if (!msg || !msg.entry || !msg.entry[0].changes || !msg.entry[0].changes[0].value.messages) {
    res.sendStatus(200);
    return;
  }

  const message = msg.entry[0].changes[0].value.messages[0];
  if (!message || !message.text || !message.text.body) {
    res.sendStatus(200);
    return;
  }

  const from = message.from;
  const text = message.text.body;

  console.log(`Mensagem de ${from}: ${text}`);

  const prompt = `
  Você é "Lumi", um(a) tutor(a) de matemática paciente e neutro(a).
  Fale em português simples, use exemplos concretos (dinheiro, comida, ônibus)
  e sempre termine com uma pergunta.

  Mensagem da criança: "${text}"
  Lumi responde:
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 200
    });

    const answer = response.choices[0].message.content.trim();

    await fetch(`https://graph.facebook.com/v20.0/${FROM_PHONE}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: from,
        type: 'text',
        text: { body: answer }
      })
    });

    console.log(`✔ Resposta enviada a ${from}: "${answer}"`);
    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Erro:', err);
    res.sendStatus(500);
  }
});

app.get('/webhook', (req, res) => {
  const verifyToken = process.env.VERIFY_TOKEN || 'lumi123';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Webhook verificado com sucesso!');
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Verificação falhou.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
