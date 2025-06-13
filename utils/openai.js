import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const cache = new Map();
const TTL = 5 * 60 * 1000; // 5 minutes

async function openaiRequest(key, messages, temperature = 0.7) {
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && now - cached.time < TTL) {
    return cached.value;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature,
      signal: controller.signal
    });
    clearTimeout(timeout);
    const msg = res.choices[0]?.message?.content || '';
    cache.set(key, { time: now, value: msg });
    return msg;
  } catch (err) {
    clearTimeout(timeout);
    console.error('OpenAI error:', err.message);
    return 'Desculpe, não consegui pensar nisso agora 🤖';
  }
}

export async function openaiExplain(prompt) {
  return openaiRequest(`explain:${prompt}`, [{ role: 'user', content: prompt }], 0.2);
}

export { openaiRequest };
