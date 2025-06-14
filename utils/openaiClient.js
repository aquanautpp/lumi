import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI();

export async function chatCompletion(messages, options = {}) {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    ...options,
  });
  return res.choices[0].message;
}

export default openai;
