import app from '../src/app.js';          // ajuste se o path diferir
import request from 'supertest';

// Função que simula uma mensagem via payload estilo Twilio
async function simulate(from, body) {
  const payload = {
    object: 'whatsapp_business_account',
    entry: [{
      id: 'local-test',
      changes: [{
        field: 'messages',
        value: {
          messages: [{
            id: Date.now().toString(),
            from,
            text: { body },
            type: 'text'
          }],
          metadata: { phone_number_id: 'sandbox' }
        }
      }]
    }]
  };

  const res = await request(app)
    .post('/webhook')
    .send(payload);
  console.log(`"${body}" ▶︎`, res.statusCode);
}

// ===== Exemplos de uso =====
const TEST_NUMBER = 'whatsapp:+5511999999999';  // número fictício
await simulate(TEST_NUMBER, 'Oi');
await simulate(TEST_NUMBER, 'Desafio de lógica');
await simulate(TEST_NUMBER, '5');
