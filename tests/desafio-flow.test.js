import request from 'supertest';
import { jest } from '@jest/globals';
import fs from 'fs/promises';

let app;
let openaiRequest;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.OPENAI_API_KEY = 'test';
  process.env.JSON_PATH = 'tmp/flow_mem.json';
  await fs.mkdir('tmp', { recursive: true });
  await fs.writeFile('tmp/flow_mem.json', '{}');

  jest.unstable_mockModule('../utils/openai.js', () => ({
    openaiRequest: jest.fn(async () => 'IA resposta'),
    openaiExplain: jest.fn(async () => 'IA explicacao')
  }));

  const openai = await import('../utils/openai.js');
  openaiRequest = openai.openaiRequest;
  app = (await import('../src/app.js')).default;
});

test('flow via webhook with Twilio payload', async () => {
  const from = 'whatsapp:+5511999999999';

  let res = await request(app).post('/webhook').send({ From: from, Body: 'Oi' });
  expect(res.status).toBe(200);
  expect(res.text).toMatch(/quer que eu te chame/i);

  res = await request(app).post('/webhook').send({ From: from, Body: 'Bob' });
  expect(res.text).toMatch(/muito prazer/i);

  res = await request(app).post('/webhook').send({ From: from, Body: 'Quero um desafio' });
  expect(res.text).toMatch(/Desafio/);

  await request(app).post('/webhook').send({ From: from, Body: 'parar' });

  res = await request(app).post('/webhook').send({ From: from, Body: 'tudo bem?' });
  expect(openaiRequest).toHaveBeenCalled();
  expect(res.text).toMatch(/IA resposta/);
});
