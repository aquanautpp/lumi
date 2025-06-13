export function explainCurrent(desafio) {
  if (!desafio) return 'Não há desafio ativo no momento.';
  let base = `A resposta correta é ${desafio.resposta}.`;
  if (desafio.explicacao) {
    base = desafio.explicacao;
  }
  return `Vamos entender passo a passo: ${base}`;
}
