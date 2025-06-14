process.env.MOCK = '1';  // liga mocks
process.env.NODE_ENV = 'test';
import request from 'supertest';
const { default: app } = await import('../src/app.js');

async function simulate(from, body) {
  const payload = {
    object: 'whatsapp_business_account',
    entry: [{
      id: 'local',
      changes: [{
        field: 'messages',
        value: {
          messages: [{
            id: Date.now().toString(),
            from,
            text: { body },
            type: 'text'
          }],
          metadata: { phone_number_id:'sandbox' }
        }
      }]
    }]
  };
  const res = await request(app).post('/webhook').send(payload);
  console.log(`"${body}" ▶︎`, res.statusCode);
}

const FROM = 'whatsapp:+5511999999999';
await simulate(FROM, 'Oi');
await simulate(FROM, 'Desafio de lógica');
await simulate(FROM, '5');
await simulate(FROM, 'missão do dia');
await simulate(FROM, 'aventura');     // inicia
await simulate(FROM, 'A');            // 1ª resposta
await simulate(FROM, 'B');            // 2ª resposta
await simulate(FROM, 'C');            // …até encerrar
await simulate(FROM, 'qual era a resposta');
console.log('✅  Simulação concluída.');
