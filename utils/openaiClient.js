import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

let client;

async function getClient() {
  if (process.env.MOCK) {
    if (!client || client.__type !== 'mock') {
      const mod = await import('../__mocks__/openai.js');
      client = mod.default || mod;
      client.__type = 'mock';
    }
  } else {
    if (!client || client.__type === 'mock') {
      client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      client.__type = 'real';
    }
  }
  return client;
}

export async function chatCompletion(messages, options = {}) {
  const openai = await getClient();
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    ...options,
  });
  return res.choices[0].message;
}
