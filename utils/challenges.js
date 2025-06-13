import { openaiExplain } from './openai.js';

export async function explainCurrent(desafio) {
  if (!desafio) return 'Não há desafio ativo no momento.';
  let base = desafio.explicacao;
  if (!base) {
    const prompt = `Explique passo a passo a solução para: ${desafio.enunciado}. A resposta correta é ${desafio.resposta}.`;
    base = await openaiExplain(prompt);
  }
  return `Vamos entender passo a passo: ${base}`;
}
