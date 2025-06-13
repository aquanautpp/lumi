import { openaiExplain } from './openai.js';

export async function explainCurrent(desafio) {
  if (!desafio) return 'Não há desafio ativo no momento.';
  let base = desafio.explicacao;
  const letras = ['A', 'B', 'C', 'D', 'E'];
  const corretaTxt = desafio.alternativas
    ? `${letras[desafio.correta]}) ${desafio.alternativas[desafio.correta]}`
    : desafio.resposta;
  if (!base) {
    const prompt = `Explique passo a passo a solução para: ${desafio.enunciado}. A alternativa correta é ${corretaTxt}.`;
    base = await openaiExplain(prompt);
  }
  return `Vamos entender passo a passo: ${base}`;
}
