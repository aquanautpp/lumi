import { chatCompletion } from "./openaiClient.js";

const cache = new Map();
const TTL = 5 * 60 * 1000; // 5 minutes

async function openaiRequest(key, messages, temperature = 0.7) {
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && now - cached.time < TTL) {
    return cached.value;
  }

  try {
    const { content } = await chatCompletion(messages, {
      model: 'gpt-4o',
      temperature
    });
    const msg = content || '';
    cache.set(key, { time: now, value: msg });
    return msg;
  } catch (err) {
    console.error('OpenAI error:', err.message);
    return 'Desculpe, não consegui pensar nisso agora 🤖';
  }
}

export async function openaiExplain(prompt) {
  return openaiRequest(`explain:${prompt}`, [{ role: 'user', content: prompt }], 0.2);
}

export { openaiRequest };
