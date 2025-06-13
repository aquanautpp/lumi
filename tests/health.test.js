import request from 'supertest';

let app;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.OPENAI_API_KEY = 'test';
  app = (await import('../src/app.js')).default;
});

test('GET /health retorna OK', async () => {
  const res = await request(app).get('/health');
  expect(res.status).toBe(200);
  expect(res.text).toBe('OK');
});
