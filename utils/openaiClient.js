import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI();

export async function chatCompletion(messages, options = {}) {
  const controller = new AbortController();
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    ...options,
    abortSignal: controller.signal,
  });
  return res.choices[0].message;
}

export default openai;
