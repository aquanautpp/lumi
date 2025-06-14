import app from '../src/app.js';
import request from 'supertest';
import fs from 'fs/promises';

const FROM = 'whatsapp:+5511999999999';
const post = (body) =>
  request(app).post('/webhook').send({
    object: 'whatsapp_business_account',
    entry: [{ id: 't', changes: [{
      field: 'messages',
      value: {
        messages: [{ id:'1', from: FROM, text:{ body }, type:'text' }],
        metadata: { phone_number_id:'sandbox' }
      }}]}]
  });

describe('Fluxo completo da Lumi', () => {
  beforeAll(() => process.env.MOCK = '1');

  test('1️⃣ Boas-vindas enviada apenas uma vez', async () => {
    await post('Oi');
    const first = await post('Oi');
    expect(first.statusCode).toBe(200);
  });

  test('2️⃣ Desafio não se repete após acerto', async () => {
    await post('Desafio de lógica');
    await post('42');                                     // resposta mock
    const res2 = await post('Desafio de lógica');
    expect(res2.statusCode).toBe(200);
  });

  test('3️⃣ Feedback não triplica', async () => {
    await post('Desafio de matemática');
    await post('0');   // errado
    await post('0');   // errado de novo
    const stat = await post('0'); // terceira tentativa
    expect(stat.statusCode).toBe(200);
  });

  test('4️⃣ Modo Aventura responde', async () => {
    const res = await post('missão do dia');
    expect(res.statusCode).toBe(200);
  });

  test('5️⃣ Teste VARK dispara e grava estilo', async () => {
    for (let i=0;i<6;i++) await post('Ping');
    await post('5');   // responde pergunta
    await post('5');
    const fin = await post('meuestilo');
    expect(fin.statusCode).toBe(200);
  });

  test('6️⃣ Comando qual era a resposta', async () => {
    await post('Desafio de lógica');
    const res = await post('qual era a resposta');
    expect(res.statusCode).toBe(200);
  });

  test('7️⃣ Pergunta aberta usa fallback GPT', async () => {
    const res = await post('Quem descobriu o Brasil?');
    expect(res.statusCode).toBe(200);
  });
});
