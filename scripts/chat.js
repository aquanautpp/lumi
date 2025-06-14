import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import app from '../src/app.js';
import request from 'supertest';

const rl = readline.createInterface({ input, output });
const FROM = 'whatsapp:+5511999999999';      // número fictício
process.env.MOCK = '1';                      // garante uso dos mocks

async function simulate(body) {
  const payload = {
    object: 'whatsapp_business_account',
    entry: [{
      id: 'cli',
      changes: [{
        field: 'messages',
        value: {
          messages: [{ id: Date.now().toString(), from: FROM,
                       text: { body }, type: 'text' }],
          metadata: { phone_number_id: 'sandbox' }
        }
      }]
    }]
  };
  await request(app).post('/webhook').send(payload);
}

/* === loop interativo === */
console.log('👋 Digite sua mensagem para a Lumi (Ctrl-C para sair)');
while (true) {
  const pergunta = await rl.question('Você: ');
  if (!pergunta.trim()) continue;
  console.log('⏳ pensando…');
  // limpa buffer “mock” onde whatsapp.js grava as respostas
  global.__twiMLMessages = [];
  await simulate(pergunta);
  // imprime tudo que o sendMessage mockou
  for (const m of global.__twiMLMessages) {
    console.log(`Lumi: ${m.body || '[mídia]'}`);
  }
}
