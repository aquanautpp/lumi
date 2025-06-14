import { jest } from '@jest/globals';
import { openaiRequest } from '../utils/openai.js';
import openaiMock from 'openai';

test('OpenAI erro 500 \u2192 mensagem de fallback', async () => {
  process.env.MOCK = '1';
  process.env.OPENAI_API_KEY = 'test';
  jest.spyOn(openaiMock.chat.completions, 'create')
    .mockRejectedValueOnce(new Error('500'));
  const txt = await openaiRequest('err','[{role:"user",content:"x"}]');
  expect(txt).toMatch(/desculpe/i);
});
