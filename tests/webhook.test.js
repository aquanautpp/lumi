import request from 'supertest';

let app;

describe('GET /webhook', () => {
  beforeAll(async () => {
    process.env.VERIFY_TOKEN = 'test-token';
    process.env.NODE_ENV = 'test';
    process.env.OPENAI_API_KEY = 'test';
    app = (await import('../index.js')).default;
  });

  test('retorna challenge quando token confere', async () => {
    const res = await request(app)
      .get('/webhook')
      .query({ 'hub.verify_token': 'test-token', 'hub.challenge': 'abc' });
    expect(res.status).toBe(200);
    expect(res.text).toBe('abc');
  });

  test('retorna 403 para token incorreto', async () => {
    const res = await request(app)
      .get('/webhook')
      .query({ 'hub.verify_token': 'errado', 'hub.challenge': 'abc' });
    expect(res.status).toBe(403);
  });
});
