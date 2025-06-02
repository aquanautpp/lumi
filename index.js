import express from 'express';
import OpenAI from 'openai';
import twilio from 'twilio';

const app = express();
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_AUTH = process.env.TWILIO_AUTH;
const FROM_PHONE = process.env.FROM_PHONE;
const TO_PHONE = process.env.TO_PHONE;

const client = twilio(TWILIO_SID, TWILIO_AUTH);

console.log("🚀 Lumi com Twilio iniciando...");

app.post('/webhook', async (req, res) => {
  console.log("📩 Webhook recebeu:", req.body);

  const msg = req.body;
  if (!msg || !msg.entry || !msg.entry[0].changes || !msg.entry[0].changes[0].value.messages) {
    res.sendStatus(200);
    return;
  }

  const message = msg.entry[0].changes[0].value.messages[0];
  const from = TO_PHONE;
  const text = message.text?.body || "";

  console.log(`Mensagem recebida de ${from}: ${text}`);

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

    await client.messages.create({
      from: FROM_PHONE,
      to: TO_PHONE,
      body: answer
    });

    console.log(`✔️ Resposta enviada via Twilio: "${answer}"`);
    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Erro ao responder:', err);
    res.sendStatus(500);
  }
});

// Webhook de verificação (opcional)
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
  console.log(`🌐 Servidor Lumi ativo na porta ${PORT}`);
});
